import { browser, by, element, protractor } from 'protractor';
import { app } from 'firebase';

export class ApplicationPage {

  private userData = {
    email: 'explorerMail3@mailexplorer.com',
    password: '12345678',
    name: 'Explorer Test',
    surname: 'Explorer e2e test',
    address: 'False Street 123',
    phone: '954123345'
  };


  navigateTo() {
    return browser.get('/trips/display/200409-LEEM');
  }

  navigateToLogin() {
    return browser.get('/login');
  }

  navigateToListApplies() {
      return browser.get('/trips-applies');
  }

  login(data: any = this.userData) {
    const EC = protractor.ExpectedConditions;
    element(by.id('email')).sendKeys(data.email);
    element(by.id('pwd')).sendKeys(data.password);
    const loginButton = element(by.id('loginbutton'));
    browser.wait(EC.elementToBeClickable(loginButton), 5000);
    loginButton.click();
    browser.wait(EC.visibilityOf(element(by.css('.swal-modal'))), 5000);
  }

  applyTrip() {
    const EC = protractor.ExpectedConditions;
    browser.ignoreSynchronization = true;
    browser.sleep(2000);
    const applyButton = element(by.id('applybutton'));


    // Scroll to an element
    return browser.executeScript(function () { arguments[0].scrollIntoView(); }, applyButton.getWebElement()).then(function () {
        browser.wait(EC.elementToBeClickable(applyButton), 5000);
        applyButton.click();
        browser.wait(EC.visibilityOf(element(by.css('.swal-modal'))), 5000);
        browser.sleep(10000);
        return element(by.css('.swal-modal')).getText();
    });
  }

  listHaveTrip() {
    const EC = protractor.ExpectedConditions;
    browser.ignoreSynchronization = true;
    browser.sleep(2000);
    return element.all(by.css("table tbody tr")).count();
    // return element(by.css("//td/a[text()='200409-LEEM']")).isPresent();
  }

}

