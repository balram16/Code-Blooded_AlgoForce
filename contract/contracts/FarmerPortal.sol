// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FarmerPortal {
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

    mapping(address => User) public users;
    mapping(address => CropListing[]) private farmerListings;
    mapping(address => Purchase[]) private deliveries;
    mapping(address => uint256) public escrowBalances;
    address[] private farmers;
    
    PurchaseRequest[] private purchaseRequests;
    mapping(address => uint[]) private farmerRequests; // Requests for each farmer
    mapping(address => uint[]) private buyerRequests; // Requests from each buyer
    uint256 private nextRequestId = 1;

    event UserRegistered(address indexed user, UserRole role);
    event UserProfileUpdated(address indexed user, string name, string profileImageCID);
    event CropListed(address indexed farmer, string cropName, uint256 price, uint256 cropID, uint256 quantity, string deliveryDate, string imageCID);
    event CropBought(address indexed buyer, address indexed farmer, uint256 cropID, uint256 quantity, uint256 amountHeld);
    event DeliveryConfirmed(address indexed buyer, address indexed farmer, uint256 cropID, uint256 amountReleased);
    event PurchaseRequested(uint256 indexed requestId, address indexed buyer, address indexed farmer, uint256 cropID, uint256 quantity);
    event RequestStatusChanged(uint256 indexed requestId, RequestStatus status);

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

    function addListing(
        string memory _cropName, 
        uint256 _price, 
        uint256 _cropID, 
        uint256 _quantity, 
        string memory _deliveryDate,
        string memory _imageCID
    ) external onlyFarmer {
        CropListing memory newCrop = CropListing(
            _cropName, 
            _price, 
            _cropID, 
            _quantity, 
            _deliveryDate, 
            msg.sender,
            _imageCID
        );
        farmerListings[msg.sender].push(newCrop);
        emit CropListed(msg.sender, _cropName, _price, _cropID, _quantity, _deliveryDate, _imageCID);
    }

    function getMyListings() external view onlyFarmer returns (CropListing[] memory) {
        return farmerListings[msg.sender];
    }

    function getUserRole(address _user) external view returns (UserRole) {
        return users[_user].role;
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

    // New function for buyers to request purchase
    function requestPurchase(uint256 cropID, uint256 quantity, string memory message) external onlyBuyer {
        // Find the crop
        address farmerAddress;
        uint256 price;
        bool found = false;
        
        for (uint256 i = 0; i < farmers.length && !found; i++) {
            address farmer = farmers[i];
            uint256 len = farmerListings[farmer].length;

            for (uint256 j = 0; j < len && !found; j++) {
                CropListing storage crop = farmerListings[farmer][j];

                if (crop.cropID == cropID && crop.quantity >= quantity) {
                    farmerAddress = farmer;
                    price = crop.price;
                    found = true;
                }
            }
        }
        
        require(found, "Crop not found or insufficient quantity.");
        
        // Create a purchase request
        uint256 requestId = nextRequestId++;
        PurchaseRequest memory newRequest = PurchaseRequest({
            requestId: requestId,
            cropID: cropID,
            quantity: quantity,
            buyer: msg.sender,
            farmer: farmerAddress,
            price: price,
            status: RequestStatus.Pending,
            message: message,
            timestamp: block.timestamp
        });
        
        purchaseRequests.push(newRequest);
        farmerRequests[farmerAddress].push(requestId);
        buyerRequests[msg.sender].push(requestId);
        
        emit PurchaseRequested(requestId, msg.sender, farmerAddress, cropID, quantity);
    }
    
    // Function for farmers to accept or reject purchase requests
    function respondToPurchaseRequest(uint256 requestId, bool accept) external onlyFarmer {
        // Find the request
        uint256 index = 0;
        bool found = false;
        
        for (uint256 i = 0; i < purchaseRequests.length && !found; i++) {
            if (purchaseRequests[i].requestId == requestId) {
                index = i;
                found = true;
            }
        }
        
        require(found, "Request not found");
        require(purchaseRequests[index].farmer == msg.sender, "Not your request to respond to");
        require(purchaseRequests[index].status == RequestStatus.Pending, "Request is not pending");
        
        if (accept) {
            purchaseRequests[index].status = RequestStatus.Accepted;
        } else {
            purchaseRequests[index].status = RequestStatus.Rejected;
        }
        
        emit RequestStatusChanged(requestId, purchaseRequests[index].status);
    }
    
    // Function for buyers to complete the purchase after acceptance
    function completePurchase(uint256 requestId) external payable onlyBuyer {
        // Find the request
        uint256 index = 0;
        bool found = false;
        
        for (uint256 i = 0; i < purchaseRequests.length && !found; i++) {
            if (purchaseRequests[i].requestId == requestId) {
                index = i;
                found = true;
            }
        }
        
        require(found, "Request not found");
        require(purchaseRequests[index].buyer == msg.sender, "Not your request");
        require(purchaseRequests[index].status == RequestStatus.Accepted, "Request has not been accepted");
        
        PurchaseRequest storage request = purchaseRequests[index];
        uint256 totalPrice = request.price * request.quantity;
        
        require(msg.value == totalPrice, "Incorrect payment amount");
        
        // Update crop quantity
        bool cropFound = false;
        for (uint256 i = 0; i < farmerListings[request.farmer].length && !cropFound; i++) {
            if (farmerListings[request.farmer][i].cropID == request.cropID) {
                require(farmerListings[request.farmer][i].quantity >= request.quantity, "Insufficient quantity available");
                farmerListings[request.farmer][i].quantity -= request.quantity;
                cropFound = true;
            }
        }
        
        require(cropFound, "Crop no longer available");
        
        // Add to escrow
                    escrowBalances[msg.sender] += totalPrice;

        // Create a purchase record
                    deliveries[msg.sender].push(
                        Purchase({
                cropID: request.cropID,
                quantity: request.quantity,
                            buyer: msg.sender,
                farmer: request.farmer,
                            amountHeld: totalPrice,
                            delivered: false
                        })
                    );

        // Update request status
        request.status = RequestStatus.Completed;
        
        emit CropBought(msg.sender, request.farmer, request.cropID, request.quantity, totalPrice);
        emit RequestStatusChanged(requestId, RequestStatus.Completed);
    }

    // Function to get purchase requests for a farmer
    function getFarmerRequests() external view onlyFarmer returns (PurchaseRequest[] memory) {
        uint256[] memory requestIds = farmerRequests[msg.sender];
        PurchaseRequest[] memory requests = new PurchaseRequest[](requestIds.length);
        
        for (uint256 i = 0; i < requestIds.length; i++) {
            uint256 requestId = requestIds[i];
            
            // Find the request in the array
            for (uint256 j = 0; j < purchaseRequests.length; j++) {
                if (purchaseRequests[j].requestId == requestId) {
                    requests[i] = purchaseRequests[j];
                    break;
                }
            }
        }
        
        return requests;
    }
    
    // Function to get purchase requests for a buyer
    function getBuyerRequests() external view onlyBuyer returns (PurchaseRequest[] memory) {
        uint256[] memory requestIds = buyerRequests[msg.sender];
        PurchaseRequest[] memory requests = new PurchaseRequest[](requestIds.length);
        
        for (uint256 i = 0; i < requestIds.length; i++) {
            uint256 requestId = requestIds[i];
            
            // Find the request in the array
            for (uint256 j = 0; j < purchaseRequests.length; j++) {
                if (purchaseRequests[j].requestId == requestId) {
                    requests[i] = purchaseRequests[j];
                    break;
                }
            }
        }
        
        return requests;
    }

    function getPendingDeliveries() external view onlyBuyer returns (Purchase[] memory) {
        uint256 count = 0;
        Purchase[] storage userPurchases = deliveries[msg.sender];

        for (uint256 i = 0; i < userPurchases.length; i++) {
            if (!userPurchases[i].delivered) {
                count++;
            }
        }

        Purchase[] memory pendingDeliveries = new Purchase[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < userPurchases.length; i++) {
            if (!userPurchases[i].delivered) {
                pendingDeliveries[index++] = userPurchases[i];
            }
        }

        return pendingDeliveries;
    }

    function confirmDelivery(uint256 cropID) external onlyBuyer {
        Purchase[] storage userPurchases = deliveries[msg.sender];

        for (uint256 i = 0; i < userPurchases.length; i++) {
            if (userPurchases[i].cropID == cropID && !userPurchases[i].delivered) {
                userPurchases[i].delivered = true;
                address farmer = userPurchases[i].farmer;
                uint256 amount = userPurchases[i].amountHeld;

                require(amount > 0, "No funds available for transfer.");
                require(escrowBalances[msg.sender] >= amount, "Insufficient escrow balance.");

    
                escrowBalances[msg.sender] -= amount;

          
                (bool success, ) = payable(farmer).call{value: amount, gas: 50000}("");
                require(success, "Transaction failed, possibly due to gas limit.");

                emit DeliveryConfirmed(msg.sender, farmer, cropID, amount);
                return;
            }
        }
        revert("No pending delivery found.");
    }
    
}
