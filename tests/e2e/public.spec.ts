import { test, expect } from '@playwright/test'

// ── Home page ──────────────────────────────────────────────────────────────

test.describe('Home page', () => {
  test('loads and shows the archive title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Waterloo Cross-Dressing Archive/)
    await expect(page.getByRole('heading', { name: /Waterloo Cross-Dressing Archive/i })).toBeVisible()
  })

  test('search bar navigates to /search with query', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('searchbox').fill('cross-dressing')
    await page.getByRole('searchbox').press('Enter')
    await expect(page).toHaveURL(/\/search\?.*q=cross-dressing/)
  })

  test('"Browse the archive" link goes to /search', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /browse the archive/i }).click()
    await expect(page).toHaveURL('/search')
  })
})

// ── Search page ────────────────────────────────────────────────────────────

test.describe('Search page', () => {
  test('loads with a results table', async ({ page }) => {
    await page.goto('/search')
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('text search updates URL param', async ({ page }) => {
    await page.goto('/search')
    const searchInput = page.getByRole('searchbox')
    await searchInput.fill('London')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/q=London/)
  })

  test('clear search removes q param', async ({ page }) => {
    await page.goto('/search?q=London')
    await page.getByRole('button', { name: /clear/i }).first().click()
    await expect(page).not.toHaveURL(/q=London/)
  })
})

// ── Map page ───────────────────────────────────────────────────────────────

test.describe('Map page', () => {
  test('loads and shows the map heading', async ({ page }) => {
    await page.goto('/map')
    await expect(page.getByRole('heading', { name: /Geographic Map/i })).toBeVisible()
  })

  test('shows location and record counts', async ({ page }) => {
    await page.goto('/map')
    await expect(page.getByText(/locations/)).toBeVisible()
  })
})

// ── Record detail page ─────────────────────────────────────────────────────

test.describe('Record detail page', () => {
  test('loads from a search results link', async ({ page }) => {
    await page.goto('/search')
    await expect(page.getByRole('table')).toBeVisible()
    await page.getByRole('link', { name: /View record/i }).first().click()
    await expect(page).toHaveURL(/\/record\/\d+/)
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('shows at least one field in the Full Record section', async ({ page }) => {
    await page.goto('/search')
    await expect(page.getByRole('table')).toBeVisible()
    const href = await page.getByRole('link', { name: /View record/i }).first().getAttribute('href')
    await page.goto(href!)
    // <dt> elements (role="term") are the field labels in the detail dl.
    await expect(page.getByRole('term').first()).toBeVisible()
  })

  test('back link returns to search page', async ({ page }) => {
    await page.goto('/search')
    await expect(page.getByRole('table')).toBeVisible()
    await page.getByRole('link', { name: /View record/i }).first().click()
    await expect(page).toHaveURL(/\/record\/\d+/)
    await page.getByRole('link', { name: /Back to search/i }).click()
    await expect(page).toHaveURL('/search')
  })
})

// ── Persons search and detail ──────────────────────────────────────────────

test.describe('Persons search', () => {
  test('persons tab shows a results table', async ({ page }) => {
    await page.goto('/search?tab=persons')
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('persons tab preserves text query in URL', async ({ page }) => {
    await page.goto('/search?tab=persons')
    await page.getByRole('searchbox').fill('Smith')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/tab=persons/)
    await expect(page).toHaveURL(/q=Smith/)
  })

  test('loads a person detail page from search results', async ({ page }) => {
    await page.goto('/search?tab=persons')
    await expect(page.getByRole('table')).toBeVisible()
    // Person rows link to /person/:id (visible text "View", sr-only "person: name").
    const viewLink = page.getByRole('link', { name: /View person/i }).first()
    await viewLink.click()
    await expect(page).toHaveURL(/\/person\/\d+/)
    await expect(page.getByRole('heading').first()).toBeVisible()
  })
})

// ── 404 ────────────────────────────────────────────────────────────────────

test('unknown route returns 404', async ({ page }) => {
  const response = await page.goto('/this-does-not-exist-xyz')
  expect(response?.status()).toBe(404)
})
