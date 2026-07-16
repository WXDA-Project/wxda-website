/**
 * Config propagation tests — verifies that changes made through the admin fields
 * UI are immediately reflected on the public-facing search pages.
 *
 * These tests mutate live data, so run them against a local Supabase instance,
 * not production. Each test reverts its own changes in a finally block.
 *
 * Serial mode is required: tests within each group target the same DB row
 * (the first field with show_in_table=true for their respective config table).
 * Parallel execution would cause those tests to interfere with each other.
 */

import { test, expect, type Page } from '@playwright/test'

const TEST_EMAIL    = 'admin@test.local'
const TEST_PASSWORD = 'TestPassword123!'

/** Escapes a string so it can be used as a literal regex pattern. */
function esc(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Returns a locator that finds a tbody row whose Label column (3rd td) exactly matches `label`. */
function rowByLabel(page: Page, label: string) {
  return page.locator('tbody tr').filter({
    has: page.locator('td:nth-child(3)').filter({ hasText: new RegExp(`^${esc(label)}$`) }),
  }).first()
}

test.describe.configure({ mode: 'serial' })

test.describe('Config propagation', () => {
  // Two full login + navigate + cache-invalidation cycles per test.
  test.setTimeout(120_000)

  /**
   * Log in and wait for the admin table to fully load.
   * The fields page wraps its content in a Suspense boundary, so the URL
   * changes to /admin/fields before the table data is ready. Without this
   * explicit wait the test can interact with a not-yet-populated skeleton.
   */
  async function login(page: Page) {
    await page.goto('/admin/login')
    await page.getByLabel('Email').fill(TEST_EMAIL)
    await page.getByLabel('Password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /Sign In/i }).click()
    await expect(page).toHaveURL(/\/admin\/fields/, { timeout: 10_000 })
    await expect(page.getByRole('table')).toBeVisible({ timeout: 15_000 })
  }

  /**
   * Navigate to the admin fields page (optionally to a specific tab) for cleanup.
   * The session is still active after the test body, so a full re-login is
   * unnecessary and fragile — a direct goto is enough. Re-login only if the
   * session somehow expired (redirect to /admin/login).
   */
  async function goToAdmin(page: Page, tab?: string) {
    const url = tab ? `/admin/fields?tab=${tab}` : '/admin/fields'
    await page.goto(url)
    if (page.url().includes('/admin/login')) {
      await login(page)
      if (tab) await page.goto(url)
    }
    await expect(page.getByRole('table')).toBeVisible({ timeout: 15_000 })
  }

  /**
   * Returns a locator for the first admin tbody row that has show_in_table
   * enabled (✓ in the 5th column). Used by person-tab tests to discover which
   * field to target without hardcoding a label.
   */
  function firstVisibleRow(page: Page) {
    return page.locator('tbody tr').filter({
      has: page.locator('td:nth-child(5)', { hasText: '✓' }),
    }).first()
  }

  // ── Document: label change propagates to search column header ───────────

  test('label change appears as search page column header', async ({ page }) => {
    await page.goto('/search')
    await expect(page.getByRole('table')).toBeVisible()
    const originalLabel = (await page.getByRole('columnheader').first().textContent())?.trim()
    expect(originalLabel).toBeTruthy()

    const testLabel = `${originalLabel}_TEST`

    await login(page)

    await rowByLabel(page, originalLabel!).getByRole('button', { name: 'Edit' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByLabel('Label').fill(testLabel)
    await dialog.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('status')).toHaveText(/Saved successfully/, { timeout: 10_000 })

    // Wait for router.refresh() — the label column must reflect the change.
    await expect(rowByLabel(page, testLabel)).toBeVisible({ timeout: 15_000 })

    try {
      await page.goto('/search')
      await expect(page.getByRole('columnheader', { name: testLabel })).toBeVisible({ timeout: 20_000 })
    } finally {
      await goToAdmin(page)

      await rowByLabel(page, testLabel).getByRole('button', { name: 'Edit' }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await page.getByRole('dialog').getByLabel('Label').fill(originalLabel!)
      await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
      await expect(page.getByRole('status')).toHaveText(/Saved successfully/, { timeout: 10_000 })

      await page.goto('/search')
      await expect(page.getByRole('columnheader', { name: originalLabel! })).toBeVisible({ timeout: 20_000 })
    }
  })

  // ── Document: show_in_table toggle hides / shows column ──────────────────

  test('toggling show_in_table removes and restores column on search page', async ({ page }) => {
    await page.goto('/search')
    await expect(page.getByRole('table')).toBeVisible()
    const columnLabel = (await page.getByRole('columnheader').first().textContent())?.trim()
    expect(columnLabel).toBeTruthy()

    await login(page)

    await rowByLabel(page, columnLabel!).getByRole('button', { name: 'Edit' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByLabel('Show in Table').uncheck()
    await dialog.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('status')).toHaveText(/Saved successfully/, { timeout: 10_000 })

    // Column 4 (0-indexed) of the admin row is the Show in Table cell.
    // After unchecking, it must display — to confirm the DB update landed.
    await expect(
      rowByLabel(page, columnLabel!).getByRole('cell').nth(4)
    ).toHaveText('—', { timeout: 15_000 })

    try {
      await page.goto('/search')
      await expect(
        page.getByRole('columnheader', { name: columnLabel! })
      ).not.toBeVisible({ timeout: 20_000 })
    } finally {
      await goToAdmin(page)

      await rowByLabel(page, columnLabel!).getByRole('button', { name: 'Edit' }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await page.getByRole('dialog').getByLabel('Show in Table').check()
      await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
      await expect(page.getByRole('status')).toHaveText(/Saved successfully/, { timeout: 10_000 })

      await page.goto('/search')
      await expect(
        page.getByRole('columnheader', { name: columnLabel! })
      ).toBeVisible({ timeout: 20_000 })
    }
  })

  // ── Person: label change propagates to persons search column header ───────
  //
  // The persons search table prepends a hardcoded "Name" column not in
  // person_field_config. To avoid parsing around that, we read the target
  // label directly from the admin Persons tab instead of the search page.

  test('label change on person field appears as persons search column header', async ({ page }) => {
    await login(page)
    await page.goto('/admin/fields?tab=person_field_config')
    await expect(page.getByRole('table')).toBeVisible({ timeout: 15_000 })

    // Find the first person field that is currently visible in the search table.
    const row = firstVisibleRow(page)
    if (await row.count() === 0) {
      test.skip()
      return
    }
    const originalLabel = (await row.locator('td:nth-child(3)').textContent())?.trim()
    expect(originalLabel).toBeTruthy()

    const testLabel = `${originalLabel}_TEST`

    await rowByLabel(page, originalLabel!).getByRole('button', { name: 'Edit' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByLabel('Label').fill(testLabel)
    await dialog.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('status')).toHaveText(/Saved successfully/, { timeout: 10_000 })
    await expect(rowByLabel(page, testLabel)).toBeVisible({ timeout: 15_000 })

    try {
      await page.goto('/search?tab=persons')
      await expect(
        page.getByRole('columnheader', { name: testLabel })
      ).toBeVisible({ timeout: 20_000 })
    } finally {
      await goToAdmin(page, 'person_field_config')

      await rowByLabel(page, testLabel).getByRole('button', { name: 'Edit' }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await page.getByRole('dialog').getByLabel('Label').fill(originalLabel!)
      await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
      await expect(page.getByRole('status')).toHaveText(/Saved successfully/, { timeout: 10_000 })

      await page.goto('/search?tab=persons')
      await expect(
        page.getByRole('columnheader', { name: originalLabel! })
      ).toBeVisible({ timeout: 20_000 })
    }
  })

  // ── Person: show_in_table toggle hides / shows column on persons search ────

  test('toggling show_in_table on person field removes and restores column on persons search', async ({ page }) => {
    await login(page)
    await page.goto('/admin/fields?tab=person_field_config')
    await expect(page.getByRole('table')).toBeVisible({ timeout: 15_000 })

    const row = firstVisibleRow(page)
    if (await row.count() === 0) {
      test.skip()
      return
    }
    const columnLabel = (await row.locator('td:nth-child(3)').textContent())?.trim()
    expect(columnLabel).toBeTruthy()

    await rowByLabel(page, columnLabel!).getByRole('button', { name: 'Edit' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByLabel('Show in Table').uncheck()
    await dialog.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('status')).toHaveText(/Saved successfully/, { timeout: 10_000 })

    // Cell nth(4) is Show in Table (0-indexed); must show — after unchecking.
    await expect(
      rowByLabel(page, columnLabel!).getByRole('cell').nth(4)
    ).toHaveText('—', { timeout: 15_000 })

    try {
      await page.goto('/search?tab=persons')
      await expect(
        page.getByRole('columnheader', { name: columnLabel! })
      ).not.toBeVisible({ timeout: 20_000 })
    } finally {
      await goToAdmin(page, 'person_field_config')

      await rowByLabel(page, columnLabel!).getByRole('button', { name: 'Edit' }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await page.getByRole('dialog').getByLabel('Show in Table').check()
      await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
      await expect(page.getByRole('status')).toHaveText(/Saved successfully/, { timeout: 10_000 })

      await page.goto('/search?tab=persons')
      await expect(
        page.getByRole('columnheader', { name: columnLabel! })
      ).toBeVisible({ timeout: 20_000 })
    }
  })

  // ── Containers: sort_order edit invalidates cache ─────────────────────────
  //
  // container_field_config has no visibility flags. The safe mutation is
  // sort_order — it changes CONTAINER_SELECT_COLUMNS column ordering but not
  // which columns are SELECTed, so it cannot break public pages. We verify
  // the field-config cache is cleared by confirming the search page still
  // loads cleanly after the save.

  test('editing a container field sort_order updates the admin table and clears the cache', async ({ page }) => {
    await login(page)
    await page.goto('/admin/fields?tab=container_field_config')
    await expect(page.getByRole('table')).toBeVisible({ timeout: 15_000 })

    // Read the first row's current sort_order from column 1.
    const firstRow = page.locator('tbody tr').first()
    const rawOrder = (await firstRow.locator('td:nth-child(1)').textContent())?.trim() ?? '0'
    const originalOrder = parseInt(rawOrder, 10)
    const newOrder = originalOrder + 100

    await firstRow.getByRole('button', { name: 'Edit' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByLabel('Sort Order').fill(String(newOrder))
    await dialog.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('status')).toHaveText(/Saved successfully/, { timeout: 10_000 })

    // Admin table must reflect the new sort_order value (row may have reordered).
    await expect(
      page.locator('tbody tr').filter({
        has: page.locator('td:nth-child(1)').filter({ hasText: new RegExp(`^${newOrder}$`) }),
      })
    ).toBeVisible({ timeout: 15_000 })

    try {
      // field-config cache was cleared: public page must still render without errors.
      await page.goto('/search')
      await expect(page.getByRole('table')).toBeVisible({ timeout: 20_000 })
    } finally {
      await goToAdmin(page, 'container_field_config')

      const editedRow = page.locator('tbody tr').filter({
        has: page.locator('td:nth-child(1)').filter({ hasText: new RegExp(`^${newOrder}$`) }),
      }).first()
      await editedRow.getByRole('button', { name: 'Edit' }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await page.getByRole('dialog').getByLabel('Sort Order').fill(String(originalOrder))
      await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
      await expect(page.getByRole('status')).toHaveText(/Saved successfully/, { timeout: 10_000 })
    }
  })

  // ── Document: filter_type toggle removes / restores sidebar filter ────────
  //
  // Clears filter_type (→ null) on the first multiselect filter found in the
  // search sidebar, verifies the group disappears, then restores it.
  // This is the only test that exercises the select input in the Edit dialog
  // and the filter sidebar as a propagation target.
  //
  // The filter label is discovered from the sidebar rather than the admin table
  // because filter_type is not a tableVisible column — it does not appear in
  // the admin table cells.

  test('clearing filter_type removes the multiselect filter from the search sidebar', async ({ page }) => {
    await page.goto('/search')
    await expect(page.getByRole('table')).toBeVisible()

    const filterPanel = page.locator('aside[aria-label="Search filters"]')
    // MultiselectGroup renders a button with aria-expanded for each multiselect field.
    // The mobile "⚙ Filters" toggle is outside the aside, so it is not matched here.
    const firstToggle = filterPanel.locator('button[aria-expanded]').first()
    if (await firstToggle.count() === 0) {
      test.skip()
      return
    }
    // Label text lives in the first child span; no selection badge is present on initial load.
    const filterLabel = (await firstToggle.locator('span').first().textContent())?.trim()
    expect(filterLabel).toBeTruthy()

    await login(page)

    await rowByLabel(page, filterLabel!).getByRole('button', { name: 'Edit' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByLabel('Filter Type').selectOption('')
    await dialog.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('status')).toHaveText(/Saved successfully/, { timeout: 10_000 })
    await expect(rowByLabel(page, filterLabel!)).toBeVisible({ timeout: 15_000 })

    try {
      await page.goto('/search')
      // The MultiselectGroup button for this filter must no longer be present.
      await expect(
        filterPanel.locator('button', { hasText: filterLabel! })
      ).not.toBeVisible({ timeout: 20_000 })
    } finally {
      await goToAdmin(page)

      await rowByLabel(page, filterLabel!).getByRole('button', { name: 'Edit' }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await page.getByRole('dialog').getByLabel('Filter Type').selectOption('multiselect')
      await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
      await expect(page.getByRole('status')).toHaveText(/Saved successfully/, { timeout: 10_000 })

      await page.goto('/search')
      await expect(
        filterPanel.locator('button', { hasText: filterLabel! })
      ).toBeVisible({ timeout: 20_000 })
    }
  })

  // ── Person: filter_type toggle removes / restores sidebar filter ──────────
  //
  // Mirrors the document filter_type test but targets the persons search tab
  // and the person_field_config admin table.

  test('clearing filter_type on a person field removes the multiselect filter from the persons sidebar', async ({ page }) => {
    await page.goto('/search?tab=persons')
    await expect(page.getByRole('table')).toBeVisible()

    const filterPanel = page.locator('aside[aria-label="Search filters"]')
    const firstToggle = filterPanel.locator('button[aria-expanded]').first()
    if (await firstToggle.count() === 0) {
      test.skip()
      return
    }
    const filterLabel = (await firstToggle.locator('span').first().textContent())?.trim()
    expect(filterLabel).toBeTruthy()

    await login(page)
    await page.goto('/admin/fields?tab=person_field_config')
    await expect(page.getByRole('table')).toBeVisible({ timeout: 15_000 })

    await rowByLabel(page, filterLabel!).getByRole('button', { name: 'Edit' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByLabel('Filter Type').selectOption('')
    await dialog.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('status')).toHaveText(/Saved successfully/, { timeout: 10_000 })
    await expect(rowByLabel(page, filterLabel!)).toBeVisible({ timeout: 15_000 })

    try {
      await page.goto('/search?tab=persons')
      await expect(
        filterPanel.locator('button', { hasText: filterLabel! })
      ).not.toBeVisible({ timeout: 20_000 })
    } finally {
      await goToAdmin(page, 'person_field_config')

      await rowByLabel(page, filterLabel!).getByRole('button', { name: 'Edit' }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await page.getByRole('dialog').getByLabel('Filter Type').selectOption('multiselect')
      await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
      await expect(page.getByRole('status')).toHaveText(/Saved successfully/, { timeout: 10_000 })

      await page.goto('/search?tab=persons')
      await expect(
        filterPanel.locator('button', { hasText: filterLabel! })
      ).toBeVisible({ timeout: 20_000 })
    }
  })

  // ── Relationships: add and delete a field ─────────────────────────────────
  //
  // relationship_field_config has only Key + Role columns — no visibility flags.
  // Adding a row with no role leaves the three load-bearing role assignments
  // (relationship-source / relationship-target / relationship-type) untouched,
  // so no query breaks. This test exercises the addField and deleteField server
  // actions, which are not covered by any other test.

  test('adding and deleting a relationship field round-trips through the admin table', async ({ page }) => {
    const dummyKey = 'test_propagation_field'

    await login(page)
    await page.goto('/admin/fields?tab=relationship_field_config')
    await expect(page.getByRole('table')).toBeVisible({ timeout: 15_000 })

    // ── Add ──
    await page.getByRole('button', { name: /Add Field/i }).click()
    const addDialog = page.getByRole('dialog')
    await expect(addDialog).toBeVisible()
    await expect(addDialog.getByRole('heading', { name: 'Add Field' })).toBeVisible()
    await addDialog.getByLabel('Key').fill(dummyKey)
    await addDialog.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('status')).toHaveText(/Saved successfully/, { timeout: 10_000 })

    // The new row must appear in the admin table (relationships ordered by id,
    // so the newest row is last).
    const newRow = page.locator('tbody tr').filter({
      has: page.locator('td:nth-child(1)').filter({ hasText: new RegExp(`^${dummyKey}$`) }),
    }).first()
    await expect(newRow).toBeVisible({ timeout: 15_000 })

    try {
      // Existing role rows are unchanged → public search still works.
      await page.goto('/search')
      await expect(page.getByRole('table')).toBeVisible({ timeout: 20_000 })
    } finally {
      // ── Delete ──
      await goToAdmin(page, 'relationship_field_config')

      const rowToDelete = page.locator('tbody tr').filter({
        has: page.locator('td:nth-child(1)').filter({ hasText: new RegExp(`^${dummyKey}$`) }),
      }).first()

      // Skip delete if add failed (row never created).
      if (await rowToDelete.count() > 0) {
        page.once('dialog', (d) => d.accept())
        await rowToDelete.getByRole('button', { name: 'Delete' }).click()
        await expect(page.getByRole('status')).toHaveText(/Field deleted/, { timeout: 10_000 })
        await expect(
          page.locator('tbody tr').filter({
            has: page.locator('td:nth-child(1)').filter({ hasText: new RegExp(`^${dummyKey}$`) }),
          })
        ).toHaveCount(0, { timeout: 15_000 })
      }
    }
  })
})
