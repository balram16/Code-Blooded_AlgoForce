const FarmerPortal = artifacts.require("FarmerPortal");

module.exports = function (deployer) {
  deployer.deploy(FarmerPortal);
};
