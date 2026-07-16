import { test, expect } from '@playwright/test'

// ── Advisory board ───────────────────────────────────────────────────────

test.describe('Advisory board page', () => {
  test('loads and shows seeded advisors', async ({ page }) => {
    await page.goto('/advisory-board')
    await expect(page.getByRole('heading', { name: 'Advisory Board', level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible()
  })
})

// ── News ─────────────────────────────────────────────────────────────────

test.describe('News page', () => {
  test('loads and shows the news timeline', async ({ page }) => {
    await page.goto('/about/news')
    await expect(page.getByRole('heading', { name: 'News', level: 1 })).toBeVisible()
  })
})

// ── Blog ─────────────────────────────────────────────────────────────────

test.describe('Blog index page', () => {
  test('loads', async ({ page }) => {
    await page.goto('/blog')
    await expect(page.getByRole('heading', { name: 'Blog', level: 1 })).toBeVisible()
  })
})

test.describe('Blog post page', () => {
  // This route needs a Suspense boundary around its dynamic `params`-dependent
  // fetch for Cache Components to build at all (verified via `npm run build` —
  // without it, the build fails with "Uncached data was accessed outside of
  // <Suspense>"). That makes the response streamed, and per Next.js's
  // documented behavior a streamed notFound() cannot change the HTTP status
  // code after headers are sent — it stays 200. Next.js compensates by
  // guaranteeing a noindex meta tag, so that's what this test verifies instead
  // of a literal 404 status.
  // https://nextjs.org/docs/app/api-reference/file-conventions/loading#status-codes
  test('unknown or unpublished slug renders the not-found UI with a noindex tag', async ({ page }) => {
    const response = await page.goto('/blog/this-slug-does-not-exist-xyz')
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { name: 'This page could not be found.' })).toBeVisible()
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', 'noindex')
  })
})

// ── Container filtering (added in b51e292) ─────────────────────────────────
// The seeded document fixtures all belong to a single container, so this
// can't assert exclusion — it verifies the filter wires up correctly
// end-to-end (checkbox → URL param → results still render), protecting
// against the filter silently breaking (wrong param key, not rendering, etc).

test.describe('Container filtering on the records search page', () => {
  test('selecting a container updates the URL and keeps results visible', async ({ page }) => {
    await page.goto('/search')
    await expect(page.getByRole('table')).toBeVisible()

    const filterPanel = page.locator('aside[aria-label="Search filters"]')
    const containerToggle = filterPanel.getByRole('button', { name: /Publication \/ Container/i })
    await expect(containerToggle).toBeVisible()
    await containerToggle.click()

    const group = filterPanel.getByRole('list', { name: /Publication \/ Container/i })
    const firstOption = group.locator('label').first()
    await expect(firstOption).toBeVisible()
    await firstOption.click()

    await filterPanel.getByRole('button', { name: /Apply Filters/i }).click()
    await expect(page).toHaveURL(/[?&]container=\d+/, { timeout: 15_000 })
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.locator('tbody tr').first()).toBeVisible()

    // Clearing the filter restores the unfiltered view.
    await page.getByRole('button', { name: 'Clear all' }).click()
    await expect(page).not.toHaveURL(/container=/, { timeout: 15_000 })
  })
})
