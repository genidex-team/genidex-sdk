import "@genidex/logger";
import 'source-map-support/register';
console.log('at abc');
console.log('123');
console.log('--------------');
// Trigger an error to test
function triggerError() {
    console.log('--------------');
    throw new Error("Something went wrong!");
}
try {
    triggerError();
}
catch (err) {
    console.error(err.stack);
}
// console.log(Error.prepareStackTrace.toString());
//# sourceMappingURL=test.js.map