// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FarmerPortalBase {
    enum UserRole { Unregistered, Farmer, Buyer }
    enum RequestStatus { Pending, Accepted, Rejected, Completed }

    struct User {
        address wallet;
        UserRole role;
        bool registered;
        string name;
        string profileImageCID;
        string location;
        string contact;
    }

    struct CropListing {
        string cropName;
        uint256 price;
        uint256 cropID;
        uint256 quantity;
        string deliveryDate;
        address farmer;
        string imageCID;
        string cultivationDate;
    }

    struct Purchase {
        uint256 cropID;
        uint256 quantity;
        address buyer;
        address farmer;
        uint256 amountHeld;
        bool delivered;
    }

    struct PurchaseRequest {
        uint256 requestId;
        uint256 cropID;
        uint256 quantity;
        address buyer;
        address farmer;
        uint256 price;
        RequestStatus status;
        string message;
        uint256 timestamp;
    }

    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => User) public users;
    mapping(address => CropListing[]) internal farmerListings;
    mapping(address => Purchase[]) internal deliveries;
    mapping(address => uint256) public escrowBalances;
    address[] internal farmers;
    
    PurchaseRequest[] internal purchaseRequests;
    mapping(address => uint[]) internal farmerRequests;
    mapping(address => uint[]) internal buyerRequests;
    uint256 internal nextRequestId = 1;

    mapping(uint256 => Bid[]) internal cropBids;

    event UserRegistered(address indexed user, UserRole role);
    event UserProfileUpdated(address indexed user, string name, string profileImageCID);
    event CropListed(address indexed farmer, string cropName, uint256 price, uint256 cropID, uint256 quantity, string deliveryDate, string imageCID, string cultivationDate);
    event CropBought(address indexed buyer, address indexed farmer, uint256 cropID, uint256 quantity, uint256 amountHeld);
    event DeliveryConfirmed(address indexed buyer, address indexed farmer, uint256 cropID, uint256 amountReleased);
    event PurchaseRequested(uint256 indexed requestId, address indexed buyer, address indexed farmer, uint256 cropID, uint256 quantity);
    event RequestStatusChanged(uint256 indexed requestId, RequestStatus status);
    event BidPlaced(uint256 indexed cropID, address indexed bidder, uint256 amount, uint256 timestamp);

    modifier onlyFarmer() {
        require(users[msg.sender].registered, "User not registered");
        require(users[msg.sender].role == UserRole.Farmer, "Only farmers allowed");
        _;
    }

    modifier onlyBuyer() {
        require(users[msg.sender].registered, "User not registered");
        require(users[msg.sender].role == UserRole.Buyer, "Only buyers allowed");
        _;
    }

    function registerUser(uint8 role) external {
        require(role == uint8(UserRole.Farmer) || role == uint8(UserRole.Buyer), "Invalid role");
        require(!users[msg.sender].registered, "User already registered");

        users[msg.sender] = User(msg.sender, UserRole(role), true, "", "", "", "");
        emit UserRegistered(msg.sender, UserRole(role));

        if (role == uint8(UserRole.Farmer)) {
            farmers.push(msg.sender);
        }
    }

    function updateUserProfile(string memory _name, string memory _profileImageCID, string memory _location, string memory _contact) external {
        require(users[msg.sender].registered, "User not registered");
        
        User storage user = users[msg.sender];
        user.name = _name;
        user.profileImageCID = _profileImageCID;
        user.location = _location;
        user.contact = _contact;
        
        emit UserProfileUpdated(msg.sender, _name, _profileImageCID);
    }

    function getUserProfile(address _userAddress) external view returns (string memory, string memory, string memory, string memory, UserRole) {
        require(users[_userAddress].registered, "User not registered");
        User memory user = users[_userAddress];
        return (user.name, user.profileImageCID, user.location, user.contact, user.role);
    }

    function getUserRole(address _user) external view returns (UserRole) {
        return users[_user].role;
    }

    function getMyListings() external view onlyFarmer returns (CropListing[] memory) {
        return farmerListings[msg.sender];
    }

    function getAllListings() external view returns (CropListing[] memory) {
        uint256 totalCrops = 0;
        for (uint256 i = 0; i < farmers.length; i++) {
            totalCrops += farmerListings[farmers[i]].length;
        }

        CropListing[] memory allListings = new CropListing[](totalCrops);
        uint256 index = 0;

        for (uint256 i = 0; i < farmers.length; i++) {
            address farmer = farmers[i]; 
            uint256 len = farmerListings[farmer].length;
            for (uint256 j = 0; j < len; j++) {
                allListings[index++] = farmerListings[farmer][j];
            }
        }

        return allListings;
    }
} 