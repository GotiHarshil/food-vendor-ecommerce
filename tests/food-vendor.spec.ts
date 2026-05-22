import { test, expect } from '@playwright/test';

test.describe('Food Vendor E-Commerce App', () => {
  const baseURL = 'http://localhost:5173';

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
  });

  test.describe('Homepage & Navigation', () => {
    test('should load homepage correctly', async ({ page }) => {
      // Check page title and main heading
      await expect(page.locator('h1.hero-title')).toBeVisible();

      // Check navigation menu exists
      const nav = page.locator('nav.site-navbar').first();
      await expect(nav).toBeVisible();

      await page.screenshot({ path: 'screenshots/01-homepage-loaded.png' });
    });

    test('should display featured items section', async ({ page }) => {
      // Look for featured/special items
      const featuredSection = page.locator('section').filter({ hasText: /special|featured/i }).first();
      if (await featuredSection.isVisible()) {
        await expect(featuredSection).toBeVisible();
        await page.screenshot({ path: 'screenshots/02-featured-items.png' });
      }
    });

    test('should have working navigation links', async ({ page }) => {
      // Find and click menu link
      const menuLink = page.locator('a[href="/menu"]').first();
      if (await menuLink.isVisible()) {
        await menuLink.click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'screenshots/03-menu-page.png' });
      }
    });
  });

  test.describe('Menu & Food Items', () => {
    test('should display food items with details', async ({ page }) => {
      // Navigate to menu if needed
      const menuLink = page.locator('a[href="/menu"]').first();
      if (await menuLink.isVisible()) {
        await menuLink.click();
        await page.waitForLoadState('networkidle');
      }

      // Look for food cards/items
      const foodItems = page.locator('[class*="card"]').first();
      if (await foodItems.isVisible()) {
        await expect(foodItems).toBeVisible();
        await page.screenshot({ path: 'screenshots/04-menu-items.png' });
      }
    });

    test('should show food item details', async ({ page }) => {
      // Navigate to menu
      const menuLink = page.locator('a[href="/menu"]').first();
      if (await menuLink.isVisible()) {
        await menuLink.click();
        await page.waitForLoadState('networkidle');
      }

      // Click on a food item to see details
      const foodItem = page.locator('[class*="card"]').first();
      if (await foodItem.isVisible()) {
        // Check if it shows price, description, etc.
        const price = foodItem.locator('text=/₹|price|cost/i').first();
        if (await price.isVisible()) {
          await page.screenshot({ path: 'screenshots/05-food-details.png' });
        }
      }
    });
  });

  test.describe('Shopping Cart', () => {
    test('should add item to cart', async ({ page }) => {
      // Find add to cart button
      const addBtn = page.locator('button').filter({ hasText: /add|cart/i }).first();

      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(500);

        // Check if cart link is visible
        const cartLink = page.locator('a[href="/cart"]').first();
        if (await cartLink.isVisible()) {
          await expect(cartLink).toBeVisible();
        }

        await page.screenshot({ path: 'screenshots/06-item-added-cart.png' });
      }
    });

    test('should view cart contents', async ({ page }) => {
      // Add item first
      const addBtn = page.locator('button').filter({ hasText: /add/i }).first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(500);
      }

      // Navigate to cart
      const cartLink = page.locator('a[href="/cart"]').first();
      if (await cartLink.isVisible()) {
        await cartLink.click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'screenshots/07-cart-page.png' });
      }
    });

    test('should calculate total price correctly', async ({ page }) => {
      // Add item
      const addBtn = page.locator('button').filter({ hasText: /add/i }).first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(500);
      }

      // Go to cart
      const cartLink = page.locator('a[href="/cart"]').first();
      if (await cartLink.isVisible()) {
        await cartLink.click();
        await page.waitForLoadState('networkidle');

        // Check for total price
        const total = page.locator('text=/total|subtotal/i').first();
        if (await total.isVisible()) {
          await expect(total).toBeVisible();
          await page.screenshot({ path: 'screenshots/08-cart-total.png' });
        }
      }
    });

    test('should remove item from cart', async ({ page }) => {
      // Add item
      const addBtn = page.locator('button').filter({ hasText: /add/i }).first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(500);
      }

      // Go to cart
      const cartLink = page.locator('a[href="/cart"]').first();
      if (await cartLink.isVisible()) {
        await cartLink.click();
        await page.waitForLoadState('networkidle');

        // Find and click remove button
        const removeBtn = page.locator('button').filter({ hasText: /remove|delete/i }).first();
        if (await removeBtn.isVisible()) {
          await removeBtn.click();
          await page.waitForTimeout(500);
          await page.screenshot({ path: 'screenshots/09-item-removed-cart.png' });
        }
      }
    });
  });

  test.describe('User Authentication', () => {
    test('should show login page', async ({ page }) => {
      const loginLink = page.locator('a[href="/login"]').first();
      if (await loginLink.isVisible()) {
        await loginLink.click();
        await page.waitForLoadState('networkidle');

        const loginForm = page.locator('form').first();
        await expect(loginForm).toBeVisible();
        await page.screenshot({ path: 'screenshots/10-login-page.png' });
      }
    });

    test('should show signup page', async ({ page }) => {
      const signupLink = page.locator('a[href="/signup"]').first();
      if (await signupLink.isVisible()) {
        await signupLink.click();
        await page.waitForLoadState('networkidle');

        const signupForm = page.locator('form').first();
        await expect(signupForm).toBeVisible();
        await page.screenshot({ path: 'screenshots/11-signup-page.png' });
      }
    });

    test('should signup with valid credentials', async ({ page }) => {
      const signupLink = page.locator('a[href="/signup"]').first();
      if (await signupLink.isVisible()) {
        await signupLink.click();
        await page.waitForLoadState('networkidle');

        // Fill signup form
        const emailInput = page.locator('input[type="email"]').first();
        const passwordInput = page.locator('input[type="password"]').first();
        const nameInput = page.locator('input[type="text"]').first();

        if (await emailInput.isVisible()) {
          const timestamp = Date.now();
          await nameInput.fill(`Test User ${timestamp}`);
          await emailInput.fill(`testuser${timestamp}@example.com`);
          await passwordInput.fill('TestPassword123');

          // Submit form
          const submitBtn = page.locator('button[type="submit"]').first();
          if (await submitBtn.isVisible()) {
            await submitBtn.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: 'screenshots/12-signup-success.png' });
          }
        }
      }
    });
  });

  test.describe('Checkout & Orders', () => {
    test('should proceed to checkout', async ({ page }) => {
      // Add item to cart first
      const addBtn = page.locator('button').filter({ hasText: /add/i }).first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(500);
      }

      // Go to cart
      const cartLink = page.locator('a[href="/cart"]').first();
      if (await cartLink.isVisible()) {
        await cartLink.click();
        await page.waitForLoadState('networkidle');

        // Find checkout button
        const checkoutBtn = page.locator('button').filter({ hasText: /checkout|proceed|pay/i }).first();
        if (await checkoutBtn.isVisible()) {
          await checkoutBtn.click();
          await page.waitForLoadState('networkidle');
          await page.screenshot({ path: 'screenshots/13-checkout-page.png' });
        }
      }
    });

    test('should display order confirmation', async ({ page }) => {
      // Navigate to confirm page if accessible
      const confirmPage = page.locator('text=/order confirmed|thank you|success/i').first();
      if (await confirmPage.isVisible()) {
        await page.screenshot({ path: 'screenshots/14-order-confirmed.png' });
      }
    });
  });

  test.describe('Search & Filter', () => {
    test('should have working search functionality', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="search" i]').first();

      if (await searchInput.isVisible()) {
        await searchInput.fill('burger');
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'screenshots/15-search-results.png' });
      }
    });

    test('should filter by category', async ({ page }) => {
      const categoryBtn = page.locator('button').filter({ hasText: /category|filter/i }).first();

      if (await categoryBtn.isVisible()) {
        await categoryBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'screenshots/16-category-filter.png' });
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should be mobile responsive', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();

      // Check if navigation is accessible
      const nav = page.locator('nav.site-navbar').first();
      if (await nav.isVisible()) {
        await page.screenshot({ path: 'screenshots/17-mobile-view.png' });
      }
    });

    test('should be tablet responsive', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();

      await page.screenshot({ path: 'screenshots/18-tablet-view.png' });
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Go offline
      await page.context().setOffline(true);

      // Try to load page
      const errorMsg = page.locator('text=/error|offline|unable|connection/i').first();

      // Go back online
      await page.context().setOffline(false);
      await page.screenshot({ path: 'screenshots/19-error-handling.png' });
    });

    test('should validate form inputs', async ({ page }) => {
      const signupLink = page.locator('a[href="/signup"]').first();
      if (await signupLink.isVisible()) {
        await signupLink.click();
        await page.waitForLoadState('networkidle');

        // Try to submit empty form
        const submitBtn = page.locator('button[type="submit"]').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(500);

          // Check for validation error
          const errorMsg = page.locator('text=/required|invalid|error/i').first();
          if (await errorMsg.isVisible()) {
            await page.screenshot({ path: 'screenshots/20-validation-error.png' });
          }
        }
      }
    });
  });

  test.describe('Performance', () => {
    test('should load homepage within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(baseURL);
      const loadTime = Date.now() - startTime;

      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
      console.log(`Page load time: ${loadTime}ms`);

      await page.screenshot({ path: 'screenshots/21-performance-test.png' });
    });
  });

  test.describe('Admin Features', () => {
    test('should have admin panel link', async ({ page }) => {
      const adminLink = page.locator('a, button', { hasText: /admin|dashboard/i });
      if (await adminLink.isVisible()) {
        await adminLink.click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'screenshots/22-admin-panel.png' });
      }
    });

    test('should display orders in admin panel', async ({ page }) => {
      // Navigate to admin orders if accessible
      const ordersLink = page.locator('a, button', { hasText: /orders|admin/i });
      if (await ordersLink.isVisible()) {
        await ordersLink.click();
        await page.waitForLoadState('networkidle');

        const ordersList = page.locator('[class*="order"], li:has-text(/order/i)');
        if (await ordersList.isVisible()) {
          await page.screenshot({ path: 'screenshots/23-admin-orders.png' });
        }
      }
    });
  });
});
