import {TodoPage} from './todo-list.po';
import {browser, protractor, by, element} from 'protractor';

describe('Todo list', () => {
  let page: TodoPage;
  const EC = protractor.ExpectedConditions;

  beforeEach(() => {
    page = new TodoPage();
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    expect(page.getTodoTitle()).toEqual('Todos');
  });

  it('Should type something in the owner filter and check that it returned correct elements', async () => {
    await page.typeInput('todo-owner-input', 'Barry');

    // All of the todo list items should have the name we are filtering by
    page.getTodoListItems().each(e => {
      expect(e.element(by.className('todo-list-owner')).getText()).toEqual('Barry');
    });
  });

  it('Should type something in the body filter and check that it returned correct elements', async () => {
    await page.typeInput('todo-body-input', 'OHMNET');

    // All of the todo list items should have the body we are filtering by
    page.getTodoListItems().each(e => {
      expect(e.element(by.className('todo-list-body')).getText()).toEqual('OHMNET');
    });
  });

  it('Should type something partial in the body filter and check that it returned correct elements', async () => {
    await page.typeInput('todo-body-input', 'ti');

    // Go through each of the list items that are being shown and get the companies
    const bodies = await page.getTodoListItems().map(e => e.element(by.className('todo-list-body')).getText());

    // We should see these companies
    expect(bodies).toContain('MOMENTIA');
    expect(bodies).toContain('KINETICUT');

    // We shouldn't see these companies
    expect(bodies).not.toContain('DATAGENE');
    expect(bodies).not.toContain('OHMNET');
  });

  it('Should type something in the status filter and check that it returned correct elements', async () => {
    await page.typeInput('todo-age-input', 'true');

    // Go through each of the list items that are being shown and get the names
    const owners = await page.getTodoListItems().map(e => e.element(by.className('todo-list-owner')).getText());

    // We should see these todos whose status is true
    expect(owners).toContain('Stokes Clayton');
    expect(owners).toContain('Bolton Monroe');
    expect(owners).toContain('Merrill Parker');

    // We shouldn't see these todos
    expect(owners).not.toContain('Connie Stewart');
    expect(owners).not.toContain('Lynn Ferguson');
  });

  it('Should change the view', async () => {
    await page.changeView('list');

    expect(page.getTodoListItems().count()).toEqual(0); // There should be no list items
    expect(page.getTodoListItems().count()).toBeGreaterThan(0); // There should be list items
  });

  it('Should select a category, switch the view, and check that it returned correct elements', async () => {
    await page.selectMatSelectValue('todo-category-select', 'math');
    await page.changeView('list');

    expect(page.getTodoListItems().count()).toBeGreaterThan(0);

    // All of the todo list items should have the role we are looking for
    page.getTodoListItems().each(e => {
      expect(e.element(by.className('todo-list-role')).getText()).toEqual('viewer');
    });


  });

  it('Should click view profile on a todo and go to the right URL', async () => {
    const firstTodoOwner = await page.getTodoListItems().first().element(by.className('todo-owner-input')).getText();
    const firstTodoBody = await page.getTodoListItems().first().element(by.className('todo-body-input')).getText();
    await page.clickViewProfile(page.getTodoListItems().first());

    // Wait until the URL contains 'todos/' (note the ending slash)
    await browser.wait(EC.urlContains('todos/'), 10000);

    // When the view profile button on the first todo list item is clicked, the URL should have a valid mongo ID
    const url = await page.getUrl();
    expect(RegExp('.*\/todos\/[0-9a-fA-F]{24}$', 'i').test(url)).toBe(true);

    // On this profile page we were sent to, the owner and body should be correct
    expect(element(by.className('todo-owner-input')).getText()).toEqual(firstTodoOwner);
    expect(element(by.className('todo-body-input')).getText()).toEqual(firstTodoBody);
  });

  it('Should click add todo and go to the right URL', async () => {
    await page.clickAddTodoFAB();

    // Wait until the URL contains 'todos/new'
    await browser.wait(EC.urlContains('todos/new'), 10000);

    // When the view profile button on the first todo list item is clicked, we should be sent to the right URL
    const url = await page.getUrl();
    expect(url.endsWith('/todos/new')).toBe(true);

    // On this profile page we were sent to, We should see the right title
    expect(element(by.className('add-todo-title')).getText()).toEqual('New Todo');
  });

});