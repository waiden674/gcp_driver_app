export class App {
  message = 'Hello World!';
  expanded = false;

  open() {
    this.expanded = !this.expanded;
  }
}
