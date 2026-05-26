import { test, expect } from '@playwright/test'

// ── Auth guard ─────────────────────────────────────────────────────────────

test.describe('Admin auth guard', () => {
  test('visiting /admin/fields redirects to login', async ({ page }) => {
    await page.goto('/admin/fields')
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('login page shows sign-in form', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.getByRole('heading', { name: /WXDA Admin Sign In/i })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible()
  })

  test('invalid credentials shows error message', async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByLabel('Email').fill('wrong@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: /Sign In/i }).click()
    // Wait for server action to complete
    await expect(page.getByText(/invalid|incorrect|failed|error/i)).toBeVisible({ timeout: 10_000 })
  })
})

// ── Admin fields page (authenticated) ─────────────────────────────────────
// Uses the test admin user created by supabase/seed.sql (local Supabase only).

const TEST_EMAIL    = 'admin@test.local'
const TEST_PASSWORD = 'TestPassword123!'

test.describe('Admin fields page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByLabel('Email').fill(TEST_EMAIL)
    await page.getByLabel('Password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /Sign In/i }).click()
    await expect(page).toHaveURL(/\/admin\/fields/, { timeout: 10_000 })
  })

  test('shows field configuration page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Field Configuration/i })).toBeVisible()
  })

  test('tab bar shows all four config tabs', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Documents' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Persons' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Containers' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Relationships' })).toBeVisible()
  })

  test('switching tabs changes the active tab', async ({ page }) => {
    await page.getByRole('link', { name: 'Persons' }).click()
    await expect(page).toHaveURL(/tab=person_field_config/)
  })

  test('Edit button opens the field dialog', async ({ page }) => {
    const firstEditButton = page.getByRole('button', { name: 'Edit' }).first()
    await firstEditButton.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Edit:/i })).toBeVisible()
  })

  test('closing the dialog hides it', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('Add Field button opens the dialog in add mode', async ({ page }) => {
    await page.getByRole('button', { name: /Add Field/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Add Field' })).toBeVisible()
  })
})
