import { Selector, t } from "testcafe";

class registerBasePage {
  constructor() {
    this.registerButton = Selector(".mdc-button__label").withText("Register");
    this.pagetitle = Selector("mat-card-header mat-card-title");
  }

  /**
   * Fills the user registration form with the provided details.
   * @param details - An array of objects containing registration information.
   */
  async fillRegistrationForm(details) {
    await t
      .expect(this.pagetitle.innerText)
      .eql("User Registration", "Not on Registration page", { timeout: 5000 });
    for (let registrationDetails of details) {
      let selectGender = Selector("mat-radio-button").withExactText(
        `${registrationDetails.gender}`
      );
      let inputFiled = Selector(
        `input[placeholder="${registrationDetails.fieldName}"]`
      );
      if (registrationDetails.hasOwnProperty("gender")) {
        await t.click(selectGender);
        await t
          .expect(selectGender.classNames)
          .contains("mat-mdc-radio-checked", "Gender Check Box not selected");
      } else {
        await t.typeText(inputFiled, registrationDetails.data, {
          paste: true,
          replace: true,
        });
        await t
          .expect(inputFiled.value)
          .eql(
            registrationDetails.data,
            "Registration field not filled as expected"
          );
      }
    }
  }

  /**
   * Generates a random string of specified length.
   *
   * @param {number} length - The desired length of the random string.
   */
  async generateString(length) {
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = " ";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }
}
export default registerBasePage;
