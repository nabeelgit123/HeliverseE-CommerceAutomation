import { Selector, t } from "testcafe";

class homeBasePage {
  constructor() {
    this.navBar = Selector(".mat-toolbar .mat-toolbar-row");
    this.brandLogo = Selector(".brand-title .material-icons");
    this.brandName = Selector(".brand-title .mdc-button__label");
    this.navBarIcons = Selector("mat-toolbar mat-icon.material-icons");
    this.searchBox = Selector("app-search .searchbox");
    this.filterOption = Selector("app-book-filter mat-nav-list");
    this.priceFilter = Selector("app-price-filter mat-card");
    this.purchaseItems = Selector(".card-deck-container app-book-card");
    this.openFavouriteList = Selector("#mat-badge-content-1");
    this.openAddToCart = Selector("#mat-badge-content-0");
    this.homePageButton = Selector(".brand-title");
    this.pageTitle = Selector("mat-card-header .mat-mdc-card-title");
  }

  /**
   * Verifies the visibility and correctness of the navigation bar elements and other HomePage elements.
   * @param {string} brandName - The expected brand name to be verified against the displayed brand name.
   */
  async verifyNavBarElements(brandName) {
    let navbarIconsCount = await this.navBarIcons.count;
    await t
      .expect(this.brandLogo.visible)
      .ok("Expected Brand Logo to be visible");
    await t
      .expect(this.brandName.visible)
      .ok("Expected Brand Name To be visible");
    await t
      .expect(this.brandName.innerText)
      .eql(brandName, "Brand Name is Incorrect");
    await t
      .expect(this.searchBox.visible)
      .ok("Expected SearchBox to be visible");
    await t.expect(this.filterOption.visible).ok("Filter Option not visible");
    await t.expect(this.priceFilter.visible).ok("Price filter is not visible");
    for (let i = 0; i < navbarIconsCount; i++) {
      await t
        .expect(this.navBarIcons.nth(i).visible)
        .ok("Icons not present in NavBar");
    }
  }

  /**
   * Verifies the visibility of essential elements for each purchase item in the shopping cart.
   * This includes checking of:
   * 1. The favourite icon
   * 2. The 'Add to Cart' button
   * 3. The item image
   * 4. The item price
   * It also ensures that the price includes the currency symbol (₹).
   */
  async verifyElementsOfPurchaseItems() {
    let purchaseItemsCount = await this.purchaseItems.count;
    for (let i = 0; i < purchaseItemsCount; i++) {
      let pusrchaseItemfavourite = this.purchaseItems.nth(i).find(".favourite");
      let purchaseItemAddToCart = this.purchaseItems
        .nth(i)
        .find("app-addtocart .mdc-button__label")
        .withText("Add to Cart");
      let purchaseItemImage = this.purchaseItems.nth(i).find("img");
      let priceOfPurchaseItem = this.purchaseItems.nth(i).find("p");
      await t
        .expect(pusrchaseItemfavourite.visible)
        .ok("Expected Favourite Icon on the purchase item should be visible");
      await t
        .expect(purchaseItemAddToCart.visible)
        .ok("Expected Add To Cart option visible on the purchase item");
      await t
        .expect(purchaseItemImage.visible)
        .ok("Expected purchase item Image to be visible on the purchase item");
      await t
        .expect(priceOfPurchaseItem.visible)
        .ok("Expected purchase item Price to be visible on the purchase item");
      await t
        .expect((await priceOfPurchaseItem.innerText).includes("₹"))
        .ok("Expected currency symbol to be visible");
    }
  }

  /**
   * Gets the index of a table column header based on the specified header text.
   *
   * @param {string} headerText - The text of the column header.
   * @param {Selector|null} anchorSelector - An optional parameter to search within a specific table.If not provided, it searches in the default table.
   *
   * The index is returened if found, otherwise, returns null.
   */
  async getTableColumnHeaderIndex(headerText, anchorSelector = null) {
    let headers;
    if (anchorSelector != null) {
      headers = anchorSelector.find("table thead tr th");
    } else {
      headers = Selector("table thead tr th");
    }

    let headerCount = await headers.count;
    for (let i = 0; i < headerCount; i++) {
      let text = await headers.nth(i).innerText;
      if (text.trim() === headerText) {
        return i;
      }
    }
    return null;
  }

  /**
   * Verifies that an item can be successfully added to the favorites list.
   * @param {string} purchaseItemName - The name of the item to be added to favorites.
   */
  async verifyAddTofavourite(purchaseItemName) {
    let itemToAddInFavourite = Selector(".card-title")
      .withText(purchaseItemName)
      .parent("app-book-card");
    let purchaseItemFavouriteOption = itemToAddInFavourite.find(".favourite");
    let afterAddToFavourite = itemToAddInFavourite.find(".favourite-selected");

    let totalFavouriteItems = Selector("#mat-badge-content-1");
    let beforeAddToFavouriteCount = Number(await totalFavouriteItems.innerText);
    let wishListTitle = Selector(".mat-mdc-card-title");
    await t.click(this.homePageButton);
    await t
      .expect(this.filterOption.visible)
      .ok("For Searching be on homePage");
    await t
      .expect(afterAddToFavourite.visible)
      .notOk(`${purchaseItemName} is already added to Favourite`);
    await t.click(purchaseItemFavouriteOption);
    await t
      .expect(afterAddToFavourite.visible)
      .ok(`${purchaseItemName} not added to Favourite`);
    await t
      .expect(Number(await totalFavouriteItems.innerText))
      .eql(
        beforeAddToFavouriteCount + 1,
        "Total number of Favourite not matched "
      );
    await t.click(this.openFavouriteList);
    await t
      .expect(wishListTitle.visible)
      .ok("Expected Wishlist page heading to be visible");
    await t.expect(wishListTitle.innerText).eql("My wishlist");
    let titleHeaderIndex = await this.getTableColumnHeaderIndex("Title");
    let expectedItemAddedToFavourite = Selector(
      `table tbody tr td:nth-child(${titleHeaderIndex + 1})`
    ).nth(0);
    await t
      .expect(expectedItemAddedToFavourite.innerText)
      .eql(
        purchaseItemName,
        `${purchaseItemName} is not added in the whsilist table`
      );
  }

  /**
   * Clears the wishlist if it is not already empty.
   */
  async clearWishList() {
    let clearWishList =
      Selector(".mdc-button__label").withText("Clear Wishlist");
    let emptyWishList = Selector(".mat-mdc-card-title").withText(
      "Your wishlist is empty."
    );
    await t
      .expect(this.openFavouriteList.visible)
      .ok("Expected Favourite Navbar option to be visible");
    await t.click(this.openFavouriteList);
    if (await clearWishList.visible) {
      await t.click(clearWishList);
    }
    await t.expect(emptyWishList.visible).ok("Expected Wislist to be empty");
  }

  /**
   * Clears the cart if it is not already empty.
   */
  async clearCart() {
    let clearCart = Selector(".mdc-button__label").withText("Clear cart");
    let emptyCart = Selector(".mat-mdc-card-title").withText(
      "Your shopping cart is empty."
    );
    await t
      .expect(this.openAddToCart.visible)
      .ok("Expected Favourite Navbar option to be visible");
    await t.click(this.openAddToCart);
    if (await clearCart.visible) {
      await t.click(clearCart);
    }
    await t.expect(emptyCart.visible).ok("Expected Cart to be empty");
  }

  /**
   * Verifies that an item can be successfully added to the cart.
   * @param {string} purchaseItemName - The name of the item to be added to cart.
   */
  async verifyAddToCart(purchaseItemName) {
    let itemtoAddInCart = Selector(".card-title")
      .withText(purchaseItemName)
      .parent("app-book-card");
    let purchaseItemAddToCartOption = itemtoAddInCart
      .find(".mdc-button__label")
      .withText("Add to Cart");
    let totalItemsInCart = Selector("span#mat-badge-content-0");
    await t
      .expect(totalItemsInCart.visible)
      .ok("Expected Total Count of Cart should be visible", { timeout: 5000 });
    let beforeAddToCartCount = await totalItemsInCart.innerText;
    let addToCartTitle = Selector(".mat-mdc-card-title");
    await t.click(this.homePageButton);
    await t
      .expect(this.filterOption.visible)
      .ok("For Searching be on homePage");
    await t.click(purchaseItemAddToCartOption);
    await t
      .expect(Number(await totalItemsInCart.innerText))
      .eql(
        Number(beforeAddToCartCount) + 1,
        "Total number of in Cart not matched "
      );
    await t.click(this.openAddToCart);
    await t
      .expect(addToCartTitle.visible)
      .ok("Expected Add To Cart page heading to be visible");
    await t.expect(addToCartTitle.innerText).eql("Shopping cart");
    let titleHeaderIndex = await this.getTableColumnHeaderIndex("Title");
    let expectedItemAddedToCart = Selector(
      `table tbody tr td:nth-child(${titleHeaderIndex + 1})`
    ).nth(0);
    await t
      .expect(expectedItemAddedToCart.innerText)
      .eql(purchaseItemName, `${purchaseItemName} is not added in Cart`);
  }

  /**
   * Clears the search box if it contains any value.
   */
  async clearSearchBox() {
    await t.expect(this.searchBox.visible).ok("Search Box should be present");
    if ((await this.searchBox.value) != "") {
      await t
        .click(this.searchBox)
        .pressKey("ctrl+a")
        .pressKey("backspace")
        .pressKey("enter");
    }
    await t
      .expect(this.searchBox.value)
      .eql("", "Expected search option to be cleared");
  }

  /**
   * Verifies the search functionality on the home page by searching for a specific item.
   * Asserts that the search result matches the expected search result.
   *
   * @param {string} textToSearch - The text of the item to search for.
   */
  async verifySearchOption(textToSearch) {
    let searchedItemOption =
      Selector("mat-option span").withExactText(textToSearch);
    let searchResult = Selector("app-book-card .card-title");
    await t.click(this.homePageButton);
    await t
      .expect(this.filterOption.visible)
      .ok("For Searching be on homePage");
    await t
      .expect(this.searchBox.visible)
      .ok("Expected search option to be visible");
    await t.typeText(this.searchBox, textToSearch, {
      paste: true,
      replace: true,
    });
    await t
      .expect(searchedItemOption.visible)
      .ok(`${textToSearch} is not present in purachse items`);
    await t.click(searchedItemOption);
    await t
      .expect(searchResult.innerText)
      .eql(
        textToSearch,
        "The Search result not matched with the expected search result"
      );
  }

  /**
   * Searches for a specific item by name and adds it to the shopping cart.
   *
   * @param {string} purchaseItemName - The name of the item to be searched and added to the cart.
   */
  async searchAndAddToCart(purchaseItemName) {
    let addToCartButton = Selector(
      "app-book-card app-addtocart .mdc-button__label"
    ).withText("Add to Cart");
    await this.verifySearchOption(purchaseItemName);
    let beforeAddToCartCount = await this.openAddToCart.innerText;
    await t.click(addToCartButton);
    await t
      .expect(Number(await this.openAddToCart.innerText))
      .eql(Number(beforeAddToCartCount) + 1);
  }

  /**
   * Fills the shipping address form with provided data.
   * @param data - An array of objects containing fieldName and fieldData for filling the form.
   */
  async fillShippingForm(data) {
    let emptyFiledHighLight = Selector(".mdc-text-field--invalid");
    let shippingForm = Selector(".mat-mdc-card-content .mat-mdc-card-title")
      .withText("Shipping address")
      .parent(0)
      .find("form");
    for (let details of data) {
      let inputField = shippingForm.find(
        `mat-form-field input[placeholder='${details.fieldName}']`
      );
      await t.typeText(inputField, details.fieldData, {
        paste: true,
        replace: true,
      });
      await t
        .expect(inputField.value)
        .eql(
          details.fieldData,
          `${details.fieldData} is not filled with expected value`
        );
    }
    await t
      .expect(emptyFiledHighLight.count)
      .eql(0, "There are Empty field in the shipping address form");
  }

  /**
   * Verifies the details  in the "My Orders" section and checks that the order details display the correct item title as expected.
   *
   * @param {string} purchaseItemName - The name of the item to verify in the order details.
   */
  async verifyOrderedItem(purchaseItemName) {
    let orderDetailsTable = Selector(
      ".example-element-detail mat-card-content"
    ).filterVisible();
    let searchOrderBox = Selector('mat-form-field input[placeholder="Search"');
    let orderIdIndex = await this.getTableColumnHeaderIndex("Order Id");
    let orderId = Selector(
      `table tbody tr td:nth-child(${orderIdIndex + 1})`
    ).nth(0);
    await t
      .expect(this.pageTitle.innerText)
      .eql("My Orders", "Not on My Order page");
    let orderIdText = await orderId.innerText;
    await t
      .expect(searchOrderBox.visible)
      .ok("Expeted Search order option to be visible");
    await t.typeText(searchOrderBox, orderIdText, {
      paste: true,
      replace: true,
    });
    await t.click(orderId);
    await t
      .expect(orderDetailsTable.visible)
      .ok("Expected order Details to be visible");
    let titleIndex = await this.getTableColumnHeaderIndex(
      "Title",
      orderDetailsTable
    );
    let orderedItemName = orderDetailsTable
      .find(`table tbody tr td:nth-child(${titleIndex + 1})`)
      .nth(0);
    await t
      .expect(orderedItemName.innerText)
      .eql(purchaseItemName, "Order Name is not as expected");
  }

  /**
   * Verifies the checkout process for a specified item.
   *
   * @param  shippingDetails - The shipping details for the order.
   * @param {string} purchaseItemName - The name of the item being purchased.
   */
  async verifyCheckOut(shippingDetails, purchaseItemName) {
    let checkoutButton = Selector("mat-card-content>td").withText("CheckOut");
    let itemPrice = Selector("mat-card p");
    let placeOrderButtton = Selector(
      "mat-card-actions .mdc-button__label"
    ).withText("Place Order");
    let originalPrice = await itemPrice.innerText;
    let checkOutGrandTotal = Selector("tfoot th").withExactText(originalPrice);
    await t.click(this.openAddToCart);
    let priceColumnIndex = await this.getTableColumnHeaderIndex("Price");
    let totalCoulmnIndex = await this.getTableColumnHeaderIndex("Total");
    let itemInCartPrice = Selector(
      `table tbody tr td:nth-child(${priceColumnIndex + 1})`
    ).nth(0);
    let totalPriceOfItem = Selector(
      `table tbody tr td:nth-child(${totalCoulmnIndex + 1})`
    ).nth(0);
    let cartTotalPrice = Selector("mat-card-content>td").nth(totalCoulmnIndex);
    await t
      .expect(itemInCartPrice.innerText)
      .eql(
        originalPrice,
        "Item Price on home page not matched with price in cart"
      );
    await t
      .expect(totalPriceOfItem.innerText)
      .eql(originalPrice, "Total Price In correct");
    await t
      .expect(cartTotalPrice.innerText)
      .eql(originalPrice, "Total Cart Price In correct");
    await t.click(checkoutButton);
    await t.expect(this.pageTitle.innerText).eql("Check Out");
    await t
      .expect(checkOutGrandTotal.visible)
      .ok("Expected the Grand Toatal to be as expected");
    await this.fillShippingForm(shippingDetails);
    await t
      .expect(placeOrderButtton.visible)
      .ok("Expected the Place Order Button to be visible");
    await t.click(placeOrderButtton);
    await t.expect(this.pageTitle.innerText).eql("My Orders");
    await this.verifyOrderedItem(purchaseItemName);
  }
}

export default homeBasePage;
