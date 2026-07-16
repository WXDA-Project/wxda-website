/**
 * Admin CRUD coverage for the content types added after the original e2e
 * suite was written: News, Advisory Board, Blog, and Page Content.
 *
 * These tests mutate live data, so run them against a local Supabase instance,
 * not production. Each test creates its own uniquely-named fixture (via a
 * Date.now() suffix) and removes it in a finally block, so tests are safe to
 * run repeatedly and don't depend on each other's data.
 *
 * The News/Advisor/Blog/Page-content forms don't associate their <label>
 * elements with their inputs (no htmlFor/id, no aria-label), so getByLabel()
 * doesn't work here — locators below fall back to placeholder text or
 * position (e.g. the page's only <textarea>).
 */

import { test, expect, type Page } from '@playwright/test'

const TEST_EMAIL    = 'admin@test.local'
const TEST_PASSWORD = 'TestPassword123!'

async function login(page: Page) {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill(TEST_EMAIL)
  await page.getByLabel('Password').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: /Sign In/i }).click()
  await expect(page).toHaveURL(/\/admin\/fields/, { timeout: 10_000 })
}

/** Types into the page's MDXEditor rich-text field (there's exactly one per admin form). */
async function fillEditor(page: Page, text: string) {
  const editor = page.locator('[contenteditable="true"]')
  await expect(editor).toBeVisible({ timeout: 15_000 })
  await editor.click()
  await editor.pressSequentially(text)
}

// ── News ─────────────────────────────────────────────────────────────────

test.describe('Admin news CRUD', () => {
  test.setTimeout(60_000)

  test('creating, editing, and deleting a news item round-trips through the list and public news page', async ({ page }) => {
    const text = `E2E news item ${Date.now()}`
    const editedText = `${text} EDITED`

    await login(page)
    await page.goto('/admin/news')
    await expect(page.getByRole('heading', { name: 'News Items' })).toBeVisible()

    await page.getByRole('link', { name: 'New Item' }).click()
    await expect(page.getByRole('heading', { name: 'New News Item' })).toBeVisible()
    await page.locator('textarea').fill(text)
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page).toHaveURL(/\/admin\/news$/, { timeout: 10_000 })
    await expect(page.locator('tbody tr').filter({ hasText: text })).toBeVisible({ timeout: 10_000 })

    try {
      await page.goto('/about/news')
      await expect(page.getByText(text)).toBeVisible({ timeout: 15_000 })

      await page.goto('/admin/news')
      await page.locator('tbody tr').filter({ hasText: text }).getByRole('link', { name: 'Edit' }).click()
      await expect(page.getByRole('heading', { name: 'Edit News Item' })).toBeVisible()
      await expect(page.locator('textarea')).toHaveValue(text)
      await page.locator('textarea').fill(editedText)
      await page.getByRole('button', { name: 'Save' }).click()
      await expect(page).toHaveURL(/\/admin\/news$/, { timeout: 10_000 })
      await expect(page.locator('tbody tr').filter({ hasText: editedText })).toBeVisible({ timeout: 10_000 })

      await page.goto('/about/news')
      await expect(page.getByText(editedText)).toBeVisible({ timeout: 15_000 })
      await expect(page.getByText(text, { exact: true })).toHaveCount(0)
    } finally {
      await page.goto('/admin/news')
      const cleanupRow = page.locator('tbody tr').filter({ hasText: editedText }).first()
      if (await cleanupRow.count() > 0) {
        page.once('dialog', (d) => d.accept())
        await cleanupRow.getByRole('button', { name: 'Delete' }).click()
        await expect(page.locator('tbody tr').filter({ hasText: editedText })).toHaveCount(0, { timeout: 10_000 })
      }
    }
  })
})

// ── Advisory board ───────────────────────────────────────────────────────

test.describe('Admin advisory board CRUD', () => {
  test.setTimeout(60_000)

  test('creating, editing, and deleting an advisor round-trips through the list and public advisory board page', async ({ page }) => {
    const name = `E2E Advisor ${Date.now()}`
    const editedName = `${name} EDITED`

    await login(page)
    await page.goto('/admin/advisory-board')
    await expect(page.getByRole('heading', { name: 'Advisory Board' })).toBeVisible()

    await page.getByRole('link', { name: 'New Advisor' }).click()
    await expect(page.getByRole('heading', { name: 'New Advisor' })).toBeVisible()
    await page.getByPlaceholder('Full name').fill(name)
    await fillEditor(page, 'A short test bio for e2e coverage.')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page).toHaveURL(/\/admin\/advisory-board$/, { timeout: 10_000 })
    await expect(page.locator('tbody tr').filter({ hasText: name })).toBeVisible({ timeout: 10_000 })

    try {
      await page.goto('/advisory-board')
      await expect(page.getByRole('heading', { name })).toBeVisible({ timeout: 15_000 })

      await page.goto('/admin/advisory-board')
      await page.locator('tbody tr').filter({ hasText: name }).getByRole('link', { name: 'Edit' }).click()
      await expect(page.getByRole('heading', { name: 'Edit Advisor' })).toBeVisible()
      await expect(page.getByPlaceholder('Full name')).toHaveValue(name)
      await page.getByPlaceholder('Full name').fill(editedName)
      await page.getByRole('button', { name: 'Save' }).click()
      await expect(page).toHaveURL(/\/admin\/advisory-board$/, { timeout: 10_000 })
      await expect(page.locator('tbody tr').filter({ hasText: editedName })).toBeVisible({ timeout: 10_000 })

      // The edit itself — not just the original create — must propagate.
      await page.goto('/advisory-board')
      await expect(page.getByRole('heading', { name: editedName })).toBeVisible({ timeout: 15_000 })
      await expect(page.getByRole('heading', { name, exact: true })).toHaveCount(0)
    } finally {
      await page.goto('/admin/advisory-board')
      const cleanupRow = page.locator('tbody tr').filter({ hasText: editedName }).first()
      if (await cleanupRow.count() > 0) {
        page.once('dialog', (d) => d.accept())
        await cleanupRow.getByRole('button', { name: 'Delete' }).click()
        await expect(page.locator('tbody tr').filter({ hasText: editedName })).toHaveCount(0, { timeout: 10_000 })
      }
    }
  })
})

// ── Blog ─────────────────────────────────────────────────────────────────

test.describe('Admin blog CRUD', () => {
  test.setTimeout(60_000)

  test('a draft is not publicly visible until published, then disappears on delete', async ({ page }) => {
    const title = `E2E Blog Post ${Date.now()}`

    await login(page)
    await page.goto('/admin/blog')
    await expect(page.getByRole('heading', { name: 'Blog Posts' })).toBeVisible()

    // ── Create as draft ──
    await page.getByRole('link', { name: 'New Post' }).click()
    await expect(page.getByRole('heading', { name: 'New Post' })).toBeVisible()
    await page.getByPlaceholder('Post title').fill(title)
    await page.getByPlaceholder('A short description of this post').fill('An e2e test post.')
    await fillEditor(page, 'This is the body of the e2e test post.')
    await page.getByRole('button', { name: 'Save Draft' }).click()
    await expect(page).toHaveURL(/\/admin\/blog$/, { timeout: 10_000 })

    const row = page.locator('tbody tr').filter({ hasText: title })
    await expect(row).toBeVisible({ timeout: 10_000 })
    await expect(row.getByText('Draft')).toBeVisible()
    // Drafts have no public "View" link.
    await expect(row.getByRole('link', { name: 'View' })).toHaveCount(0)

    try {
      // Draft must not appear on the public blog index.
      await page.goto('/blog')
      await expect(page.getByRole('heading', { name: title })).toHaveCount(0)

      // ── Publish ──
      await page.goto('/admin/blog')
      await page.locator('tbody tr').filter({ hasText: title }).getByRole('link', { name: 'Edit' }).click()
      await expect(page.getByRole('heading', { name: 'Edit Post' })).toBeVisible()
      await expect(page.getByPlaceholder('Post title')).toHaveValue(title)
      // MDXEditor loads async (next/dynamic) and must finish mounting with the
      // post's existing content before Publish reads editorRef.getMarkdown() —
      // otherwise it reads an empty editor and silently wipes the body.
      await expect(page.locator('[contenteditable="true"]')).toContainText('This is the body of the e2e test post.', { timeout: 15_000 })
      await page.getByRole('button', { name: 'Publish' }).click()
      await expect(page).toHaveURL(/\/admin\/blog$/, { timeout: 10_000 })

      const publishedRow = page.locator('tbody tr').filter({ hasText: title })
      await expect(publishedRow.getByText('Published')).toBeVisible({ timeout: 10_000 })
      const viewHref = await publishedRow.getByRole('link', { name: 'View' }).getAttribute('href')
      expect(viewHref).toBeTruthy()

      // Now visible on the public index and at its own URL.
      await page.goto('/blog')
      await expect(page.getByRole('heading', { name: title })).toBeVisible({ timeout: 15_000 })

      await page.goto(viewHref!)
      await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible()
      await expect(page.getByText('This is the body of the e2e test post.')).toBeVisible()
    } finally {
      await page.goto('/admin/blog')
      const cleanupRow = page.locator('tbody tr').filter({ hasText: title }).first()
      if (await cleanupRow.count() > 0) {
        page.once('dialog', (d) => d.accept())
        await cleanupRow.getByRole('button', { name: 'Delete' }).click()
        await expect(page.locator('tbody tr').filter({ hasText: title })).toHaveCount(0, { timeout: 10_000 })
      }
      await page.goto('/blog')
      await expect(page.getByRole('heading', { name: title })).toHaveCount(0)
    }
  })
})

// ── Page content ─────────────────────────────────────────────────────────

test.describe('Admin page content editing', () => {
  test.setTimeout(60_000)

  test('editing the home tagline propagates to the homepage', async ({ page }) => {
    await login(page)
    await page.goto('/admin/pages')
    await expect(page.getByRole('heading', { name: 'Page Content' })).toBeVisible()

    const row = page.locator('tbody tr').filter({ hasText: 'Home — Tagline' })
    await expect(row).toBeVisible()
    await row.getByRole('link', { name: 'Edit' }).click()
    await expect(page.getByRole('heading', { name: 'Home — Tagline' })).toBeVisible()

    const editor = page.locator('[contenteditable="true"]')
    await expect(editor).toBeVisible({ timeout: 15_000 })
    const originalText = (await editor.textContent())?.trim() ?? ''
    expect(originalText.length).toBeGreaterThan(0)
    const testText = `E2E page content test ${Date.now()}`

    async function replaceContent(text: string) {
      const ed = page.locator('[contenteditable="true"]')
      await ed.click()
      await page.keyboard.press('Control+A')
      await page.keyboard.type(text)
      await page.getByRole('button', { name: 'Save' }).click()
      await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 10_000 })
    }

    await replaceContent(testText)

    try {
      await page.goto('/')
      await expect(page.getByText(testText)).toBeVisible({ timeout: 15_000 })
    } finally {
      await page.goto('/admin/pages')
      await page.locator('tbody tr').filter({ hasText: 'Home — Tagline' }).getByRole('link', { name: 'Edit' }).click()
      await expect(page.getByRole('heading', { name: 'Home — Tagline' })).toBeVisible()
      await replaceContent(originalText)

      await page.goto('/')
      await expect(page.getByText(originalText)).toBeVisible({ timeout: 15_000 })
    }
  })
})
