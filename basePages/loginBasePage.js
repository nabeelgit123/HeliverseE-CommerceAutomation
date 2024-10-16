import { Selector, t } from "testcafe";

class loginBasePage {
  constructor() {
    this.validUserName = "SamUser";
    this.validPassword = "Samuser123";
    this.usernameInput = Selector('input[placeholder="Username"]');
    this.passwordInput = Selector('input[placeholder="Password"]');
    this.loginButton = Selector(
      ".mdc-card .mdc-button .mdc-button__label"
    ).withText("Login");
    this.loggedInUSerName = Selector(
      ".mat-mdc-menu-trigger .mdc-button__label span"
    );
    this.errorMessage = Selector("mat-error.mat-mdc-form-field-error");
    this.emptyUsernameError = Selector("#mat-mdc-form-field-label-0")
      .parent("mat-form-field")
      .find(".mat-mdc-form-field-error");
    this.emptyPasswordError = Selector("#mat-mdc-form-field-label-2")
      .parent("mat-form-field")
      .find(".mat-mdc-form-field-error");
  }

  /**
   * Logs into the application using the provided username and password.
   *
   * @param {string} username - The username of the user attempting to log in.
   * @param {string} password - The password associated with the provided username.
   */
  async loginToApp(username, password) {
    await t
      .expect(this.usernameInput.visible)
      .ok("Username Input field not visible");
    await t
      .expect(this.passwordInput.visible)
      .ok("Password Input field not visible");
    await t
      .typeText(this.usernameInput, username, { paste: true })
      .typeText(this.passwordInput, password, { paste: true });
    await t.expect(this.loginButton.visible).ok("Login Button not visisble");
    await t.click(this.loginButton);
    await t
      .expect(this.loggedInUSerName.innerText)
      .eql(username, "Expected User Was not Logged In");
  }

  /**
   * Performs the login action by clicking on the login button.
   *
   * @param {string} username - The username to enter in the username input field.
   * @param {string} password - The password to enter in the password input field.
   */
  async performLogin(username, password) {
    await t
      .expect(this.usernameInput.visible)
      .ok("Username Input field not visible");
    await t
      .expect(this.passwordInput.visible)
      .ok("Password Input field not visible");
    await t
      .typeText(this.usernameInput, username, { paste: true })
      .typeText(this.passwordInput, password, { paste: true });
    await t
      .expect(this.errorMessage.exists)
      .notOk("Expected Error Message not to be visible while entering Data");
    await t.expect(this.loginButton.visible).ok("Login Button not visisble");
    await t.click(this.loginButton);
  }
}

export default loginBasePage;
