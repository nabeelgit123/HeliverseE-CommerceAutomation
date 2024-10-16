import { Selector } from "testcafe";
import loginBasePage from "../basePages/loginBasePage";
import homeBasePage from "../basePages/homeBasePage";
import registerBasePage from "../basePages/registerBasePage";

const loginPage = new loginBasePage();
const homePage = new homeBasePage();
const registerPage = new registerBasePage();
const loginUrl = "https://bookcart.azurewebsites.net/login";
const loginData = require("../testData/loginData.json");
const registerPageData = require("../testData/registerFormData.json");
const shippingFormData = require("../testData/shippingData.json");

fixture`BookCart website Test Cases`.page(loginUrl).beforeEach(async (t) => {
  let curretUrl = await t.eval(() => window.location.href);
  await t.expect(curretUrl).eql(loginUrl, "Current Page is not Login Page");
  await t.maximizeWindow();
});

test("Login Test: Login with Valid Credentails", async (t) => {
  await loginPage.loginToApp(loginPage.validUserName, loginPage.validPassword);
});

loginData.invalidCredentials.forEach((data) => {
  test(`Login Test: Login with Invalid Credentials (${data.testCase}) and Verify Error Message`, async (t) => {
    let expectedErrorMessage = "Username or Password is incorrect.";
    let expectedEmptyUserNameErrorMesssage = "Username is required";
    let expectedEmptyPasswordErrorMessage = "Password is required";

    //Verifying Login when field are empty
    if (data.testCase.includes("Empty")) {
      if (data.password == " " && data.username == " ") {
        await t
          .typeText(loginPage.usernameInput, " ", {
            paste: true,
          })
          .pressKey("backspace");

        await t
          .typeText(loginPage.passwordInput, " ", {
            paste: true,
          })
          .pressKey("backspace");
        await t.click(loginPage.loginButton);
        await t
          .expect(loginPage.emptyPasswordError.visible)
          .ok(
            "Expected empty field error message for USerName should be visible"
          );
        await t
          .expect(loginPage.emptyPasswordError.textContent)
          .eql(
            expectedEmptyPasswordErrorMessage,
            "Empty UserName error Message not as expected"
          );
        await t
          .expect(loginPage.emptyUsernameError.visible)
          .ok(
            "Expected empty field error message for USerName should be visible"
          );
        await t
          .expect(loginPage.emptyUsernameError.textContent)
          .eql(
            expectedEmptyUserNameErrorMesssage,
            "Empty UserName error Message not as expected"
          );
      }
      if (data.username == " " && data.password != " ") {
        await t.typeText(loginPage.usernameInput, " ").pressKey("backspace");
        await t.typeText(loginPage.passwordInput, data.password, {
          paste: true,
        });
        await t.click(loginPage.loginButton);
        await t
          .expect(loginPage.emptyUsernameError.visible)
          .ok(
            "Expected empty field error message for USerName should be visible"
          );
        await t
          .expect(loginPage.emptyUsernameError.textContent)
          .eql(
            expectedEmptyUserNameErrorMesssage,
            "Empty UserName error Message not as expected"
          );
      }
      if (data.password == " " && data.username != " ") {
        await t.typeText(loginPage.usernameInput, data.username, {
          paste: true,
        });

        await t
          .typeText(loginPage.passwordInput, " ", {
            paste: true,
          })
          .pressKey("backspace");
        await t.click(loginPage.loginButton);
        await t
          .expect(loginPage.emptyPasswordError.visible)
          .ok(
            "Expected empty field error message for USerName should be visible"
          );
        await t
          .expect(loginPage.emptyPasswordError.textContent)
          .eql(
            expectedEmptyPasswordErrorMessage,
            "Empty UserName error Message not as expected"
          );
      }
    } else {
      //Verifying Login when field are not empty but invalid
      await loginPage.performLogin(data.username, data.password);
      await t
        .expect(loginPage.errorMessage.visible)
        .ok("Expected Invalid Error Message Visible");
      await t
        .expect(loginPage.errorMessage.textContent)
        .eql(expectedErrorMessage, "Invalid Error Message is not as expected");
    }
  });
});

test("UI Test: to verify the presence and functioning of key UI elements on the homepage.", async (t) => {
  let expectedBrandName = "Book Cart";
  let purchaseItemName = "Slayer";
  let searchText = "Red Rising";
  await loginPage.loginToApp(loginPage.validUserName, loginPage.validPassword);
  await homePage.verifyNavBarElements(expectedBrandName);
  await homePage.verifyElementsOfPurchaseItems();
  await homePage.clearWishList();
  await homePage.verifyAddTofavourite(purchaseItemName);
  await homePage.clearCart();
  await homePage.verifyAddToCart(purchaseItemName);
  await homePage.verifySearchOption(searchText);
  await homePage.clearSearchBox();
}).after(async (t) => {
  await homePage.clearWishList();
  await homePage.clearCart();
});

test("Functional Test: testcase where a user searches for a product,adds it to the cart, and proceeds to checkout.", async (t) => {
  let itemName = "Robbie";
  await loginPage.loginToApp(loginPage.validUserName, loginPage.validPassword);
  await homePage.clearCart();
  await homePage.searchAndAddToCart(itemName);
  await homePage.verifyCheckOut(shippingFormData.shippingDetails, itemName);
});

test("Form Validation Test: Register with all fields empty", async (t) => {
  await t.click(registerPage.registerButton);
  await t.expect(registerPage.pagetitle.innerText).eql("User Registration");
  await t.click(registerPage.registerButton);
  for (let name of registerPageData.fieldNames) {
    let redHighLightedInputField = Selector(
      `input[placeholder="${name.fieldName}"]`
    ).parent(".mdc-text-field--invalid");
    await t
      .expect(redHighLightedInputField.visible)
      .ok(`${name.fieldName} not highlighted in red`);
  }
});

test("Form Validation Test: Register Form password matching Validation", async (t) => {
  let passwordNotMatch = Selector("mat-error");
  await t.click(registerPage.registerButton);
  await registerPage.fillRegistrationForm(
    registerPageData.passwordMatchingValidation
  );
  await t.click(registerPage.registerButton);
  await t
    .expect(passwordNotMatch.visible)
    .ok("Expected Password not matched Error visible");
  await t.expect(passwordNotMatch.innerText).eql(" Password do not match");
});

test("Form Validation Test: Register Form UserName Availability Validation", async (t) => {
  let usernameNotAvailable = Selector("mat-error");
  await t.click(registerPage.registerButton);
  await registerPage.fillRegistrationForm(
    registerPageData.userNameAvailabilityValidation
  );
  await t.click(registerPage.registerButton);
  await t
    .expect(usernameNotAvailable.visible)
    .ok("Expected Password not matched Error visible");
  await t
    .expect(usernameNotAvailable.innerText)
    .eql("User Name is not available");
});

test("Form Validation Test: Register Form passsword format Validation", async (t) => {
  let passwordFormatError = Selector("mat-error");
  await t.click(registerPage.registerButton);
  await registerPage.fillRegistrationForm(
    registerPageData.passswordFormatValidation
  );
  await t
    .expect(passwordFormatError.visible)
    .ok("Expected Password not matched Error visible");
  await t
    .expect(passwordFormatError.innerText)
    .eql(
      " Password should have minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter and 1 number"
    );
});

test("Form Validation Test: Register Form required Field Validation", async (t) => {
  await t.click(registerPage.registerButton);
  await registerPage.fillRegistrationForm(
    registerPageData.requiredFieldValidation
  );
  await t.click(registerPage.registerButton);
  for (let name of registerPageData.fieldNames) {
    let inputField = Selector(`input[placeholder="${name.fieldName}"]`);
    let errorMessage = inputField.parent("mat-form-field").find("mat-error");
    await t.click(inputField).pressKey("backspace");
    await t
      .expect(errorMessage.innerText)
      .eql(`${name.errorFieldName} is required`);
  }
});

test("Form Validation Test: Register Form correct Registration Details", async (t) => {
  let registrationButton = Selector("app-user-registration button").withText(
    "Register"
  );
  let randomNumber = Math.floor(Math.random() * 4) + 1;
  let userNameIndex = registerPageData.correctRegistrationDetails.findIndex(
    (el) => el.fieldName == "User name"
  );
  let passwordIndex = registerPageData.correctRegistrationDetails.findIndex(
    (el) => el.fieldName == "Password"
  );
  let uniqueIdentifier = await registerPage.generateString(randomNumber);
  let newUserName =
    registerPageData.correctRegistrationDetails[userNameIndex].data +
    uniqueIdentifier;
  registerPageData.correctRegistrationDetails[userNameIndex].data =
    newUserName.replace(" ", "");
  await t.click(registerPage.registerButton);
  await registerPage.fillRegistrationForm(
    registerPageData.correctRegistrationDetails
  );
  await t
    .expect(registrationButton.visible)
    .ok("Expected Register button to be visible");
  await t.doubleClick(registrationButton);
  if (!registrationButton.visible) {
    await t.click(registrationButton);
  }
  await t.expect(registerPage.pagetitle.visible).ok("Page Title not visible");
  await t
    .expect(registerPage.pagetitle.innerText)
    .eql("Login", { timeout: 5000 });
  await loginPage.loginToApp(
    newUserName.replace(" ", ""),
    registerPageData.correctRegistrationDetails[passwordIndex].data
  );
});
