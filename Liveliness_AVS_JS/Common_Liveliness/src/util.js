// hacky af but it works
// ethers continously logs if it can't connect to the network
function suppressEthersJsonRpcProviderError() {
  const previousConsoleLog = console.log;
  console.log = (message, ...optionalParameters) => { 
    if (message.toString().startsWith("JsonRpcProvider failed to detect network and cannot start up;")) {
      return;
    }
    
    previousConsoleLog(message, ...optionalParameters);
  }
  
  const previousConsoleError = console.error;
  console.error = (message, ...optionalParameters) => {
    if (message.toString().startsWith("JsonRpcProvider failed to detect network and cannot start up;")) {
      return;
    }
    
    previousConsoleError(message, ...optionalParameters);
  }
}

module.exports = {
  suppressEthersJsonRpcProviderError,
};