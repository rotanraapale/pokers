// Constants for player actions
const ACTION_CHECK = 'Check';
const ACTION_RAISE = 'Raise';
const ACTION_FOLD = 'Fold';

// Constants for timing
const TURN_TIME_LIMIT = 30; // 30 seconds for each turn

// Coordinates for cards: row 0 = clubs, row 1 = diamonds, row 2 = hearts, row 3 = spades
const cardRows = {
    clubs: 0,
    diamonds: 1,
    hearts: 2,
    spades: 3
};

// Seat positions for easy modification
const seatPositions = [
    { x: 250, y: 600, width: 100 }, 
    { x: 500, y: 825, width: 100 }, 
    { x: 350, y: 325, width: 100 }, 
    { x: 1000, y: 825, width: 100 }, 
    { x: 1250, y: 600, width: 100 }, 
    { x: 1150, y: 325, width: 100 }
];

// Variable to store selected gender and player status
let selectedGender = null;
let hasBoughtIn = false;
let playerStatus = Array(seatPositions.length).fill(false);  // Track whether a player has bought in each seat
let currentPlayerIndex = 0;  // Track the index of the current player
let turnTimer; // Variable for the timer

// Function to handle the start of a player's turn
function startTurn() {
    // If there's only one player, show their actions immediately
    const activePlayers = playerStatus.filter(status => status).length;
    if (activePlayers === 0) {
        return; // No active players to take a turn
    }

    currentPlayerIndex = findNextActivePlayer(currentPlayerIndex); // Find the next active player
    showActionButtons(); // Show action buttons for the current player
    startTimer(); // Start the timer for the current player's turn
}

// Function to find the next active player
function findNextActivePlayer(startIndex) {
    let index = startIndex;

    do {
        index = (index + 1) % playerStatus.length; // Move to the next player
    } while (!playerStatus[index]); // Continue until we find an active player

    return index; // Return the index of the next active player
}

// Function to move to the next player's turn
function nextPlayerTurn() {
    currentPlayerIndex = findNextActivePlayer(currentPlayerIndex); // Move to the next active player
    startTurn(); // Start the turn for the next player
}

// Function to show action buttons for the player's turn
function showActionButtons() {
    const actionButtons = document.createElement('div');
    actionButtons.classList.add('action-buttons');
    actionButtons.innerHTML = `
        <button class="action-btn check-btn">${ACTION_CHECK}</button>
        <button class="action-btn raise-btn">${ACTION_RAISE}</button>
        <button class="action-btn fold-btn">${ACTION_FOLD}</button>
    `;

    // Append the buttons to the game table (adjust for layout)
    document.getElementById('table').appendChild(actionButtons);
    
    // Add event listeners for actions
    document.querySelector('.check-btn').addEventListener('click', () => handleAction(ACTION_CHECK));
    document.querySelector('.raise-btn').addEventListener('click', () => handleAction(ACTION_RAISE));
    document.querySelector('.fold-btn').addEventListener('click', () => handleAction(ACTION_FOLD));
}

// Function to start the turn timer
function startTimer() {
    let timeRemaining = TURN_TIME_LIMIT;
    const timerDisplay = document.createElement('div');
    timerDisplay.classList.add('timer-display');
    timerDisplay.innerText = `Time: ${timeRemaining}s`;
    document.getElementById('table').appendChild(timerDisplay);

    turnTimer = setInterval(() => {
        timeRemaining--;
        timerDisplay.innerText = `Time: ${timeRemaining}s`;
        if (timeRemaining <= 0) {
            clearInterval(turnTimer);
            handleAction(ACTION_FOLD); // Auto-fold if time runs out
        }
    }, 1000);
}

// Function to handle player actions (check, raise, fold)
function handleAction(action) {
    clearInterval(turnTimer); // Stop the timer once an action is taken

    // Remove action buttons and timer
    document.querySelector('.action-buttons').remove();
    document.querySelector('.timer-display').remove();

    if (action === ACTION_FOLD) {
        playerStatus[currentPlayerIndex] = false; // Mark the player as folded
    }

    // Move to the next player's turn
    nextPlayerTurn();
}

// Function to randomly deal 2 cards to each player
function dealCardsToPlayers() {
    const deck = [];
    for (let suit in cardRows) {
        for (let cardIndex = 0; cardIndex < 13; cardIndex++) {
            deck.push({ cardIndex, suit: cardRows[suit] });
        }
    }

    const shuffledDeck = deck.sort(() => 0.5 - Math.random());
    let deckIndex = 0;

    seatPositions.forEach((seat, index) => {
        if (playerStatus[index]) {
            // Deal two cards to the player in this seat
            for (let i = 0; i < 2; i++) {
                const card = shuffledDeck[deckIndex++];
                createCardForPlayer(card.cardIndex, card.suit, index, i);
            }
        }
    });
}

// Function to create and animate a card for a player
function createCardForPlayer(cardIndex, suitIndex, seatIndex, cardPosition) {
    const card = document.createElement('div');
    card.classList.add('card');

    // Adjust card background position based on card index and suit
    const bgPosX = -(cardIndex * 81) + 'px';
    const bgPosY = -(suitIndex * 117) + 'px';
    card.style.backgroundPosition = `${bgPosX} ${bgPosY}`;
    
    // Starting position of card (dealer position)
    card.style.transform = `translate(800px, 175px) scale(1)`;  // Full size
    
    document.getElementById('table').appendChild(card);
    
    // Animate the card to the player's seat (resize to 0.75 size)
    setTimeout(() => {
        const targetX = seatPositions[seatIndex].x + (cardPosition * 50);  // Offset cards slightly
        const targetY = seatPositions[seatIndex].y + 50; // Place below profile icon
        card.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.75)`; // Rescale to 0.75 size
    }, 100 * seatIndex + 50 * cardPosition);  // Stagger the animation timing
}

// Other game functions (login, buy-in, etc.) remain the same

// Function to show the overlay
function showOverlay() {
    document.getElementById('overlay').style.display = 'block';
}

// Function to close the overlay
function closeOverlay() {
    document.getElementById('overlay').style.display = 'none';
}

// Function to handle gender selection
function selectGender(gender) {
    selectedGender = gender;
    const maleImg = document.getElementById('male');
    const femaleImg = document.getElementById('female');
    maleImg.style.opacity = gender === 'male' ? '1' : '0.75';
    femaleImg.style.opacity = gender === 'female' ? '1' : '0.75';
}

// Function to validate log-in credentials
function validateLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    if (username === 'rab' && password === 'apina') {
        errorMessage.textContent = '';
        closeOverlay();
        document.getElementById('login-button').style.display = 'none'; // Hide the login button
    } else {
        errorMessage.textContent = 'Invalid username or password.';
    }
}

const socket = io('http://your-server-url:3000'); // Change to your server URL

// Handle login button click
document.getElementById('login-button').addEventListener('click', function() {
    const username = document.getElementById('username').value;
    socket.emit('joinGame', username); // Notify server about new player
    document.getElementById('overlay').style.display = 'none'; // Hide overlay
});

// Listen for player list updates
socket.on('playerList', (players) => {
    console.log('Current players:', players); // Update your UI as needed
});

// Handle actions from other players
socket.on('gameAction', (action) => {
    console.log('Game action received:', action); // Update game state as needed
});

// Function to handle buy-in for the seats
function buyIn(seatIndex) {
    if (hasBoughtIn) return; // Prevent multiple buy-ins

    hasBoughtIn = true; // Set that the user has bought in
    playerStatus[seatIndex] = true;  // Mark seat as bought-in
    const seatElement = document.getElementById(`seat-${seatIndex}`);
    seatElement.innerHTML = ''; // Clear the seat text
    seatElement.style.backgroundColor = 'transparent'; // Clear background color
    
    // Create profile icon
    const profileIcon = document.createElement('img');
    profileIcon.src = selectedGender === 'male' ? 'male.png' : 'female.png';
    profileIcon.classList.add('profile-icon');

    // Create user info
    const userInfo = document.createElement('div');
    userInfo.classList.add('user-info');
    userInfo.innerHTML = `
        <div>${document.getElementById('username').value}</div>
        <div>Chips: $1000</div>
    `;

    // Append profile icon and user info to the seat
    seatElement.appendChild(profileIcon);
    seatElement.appendChild(userInfo);

    // Deal cards after buy-in
    dealCardsToPlayers();

    // Check if it is the first player's turn, and start the game loop
    if (currentPlayerIndex === 0 || playerStatus[currentPlayerIndex]) {
        startTurn(); // Start the turn for the first player or the next active player
    }
}

// Function to handle player folding, raising, or checking
function handleAction(action) {
    clearInterval(turnTimer); // Stop the timer once an action is taken

    // Remove action buttons and timer display from the DOM
    document.querySelector('.action-buttons').remove();
    document.querySelector('.timer-display').remove();

    if (action === ACTION_FOLD) {
        // If the player folds, mark them as inactive
        playerStatus[currentPlayerIndex] = false;
        console.log(`Player at seat ${currentPlayerIndex + 1} folded.`);
    } else if (action === ACTION_CHECK) {
        console.log(`Player at seat ${currentPlayerIndex + 1} checked.`);
    } else if (action === ACTION_RAISE) {
        console.log(`Player at seat ${currentPlayerIndex + 1} raised.`);
    }

    // Move to the next player's turn
    nextPlayerTurn();
}

// Function to show action buttons for the player's turn
function showActionButtons() {
    const actionButtons = document.createElement('div');
    actionButtons.classList.add('action-buttons');
    actionButtons.innerHTML = `
        <button class="action-btn check-btn">${ACTION_CHECK}</button>
        <button class="action-btn raise-btn">${ACTION_RAISE}</button>
        <button class="action-btn fold-btn">${ACTION_FOLD}</button>
    `;

    // Append action buttons to the game table
    document.getElementById('table').appendChild(actionButtons);
    
    // Add event listeners for action buttons
    document.querySelector('.check-btn').addEventListener('click', () => handleAction(ACTION_CHECK));
    document.querySelector('.raise-btn').addEventListener('click', () => handleAction(ACTION_RAISE));
    document.querySelector('.fold-btn').addEventListener('click', () => handleAction(ACTION_FOLD));
}

// Function to start the player's turn timer
function startTimer() {
    let timeRemaining = TURN_TIME_LIMIT; // Initialize the countdown
    const timerDisplay = document.createElement('div');
    timerDisplay.classList.add('timer-display');
    timerDisplay.innerText = `Time: ${timeRemaining}s`;
    document.getElementById('table').appendChild(timerDisplay);

    turnTimer = setInterval(() => {
        timeRemaining--;
        timerDisplay.innerText = `Time: ${timeRemaining}s`;
        if (timeRemaining <= 0) {
            clearInterval(turnTimer);
            handleAction(ACTION_FOLD); // Auto-fold if the timer runs out
        }
    }, 1000); // Decrease time every second
}

// Function to randomly deal 2 cards to each player
function dealCardsToPlayers() {
    const deck = [];
    for (let suit in cardRows) {
        for (let cardIndex = 0; cardIndex < 13; cardIndex++) {
            deck.push({ cardIndex, suit: cardRows[suit] });
        }
    }

    const shuffledDeck = deck.sort(() => 0.5 - Math.random());
    let deckIndex = 0;

    seatPositions.forEach((seat, index) => {
        if (playerStatus[index]) {
            // Deal two cards to the player in this seat
            for (let i = 0; i < 2; i++) {
                const card = shuffledDeck[deckIndex++];
                createCardForPlayer(card.cardIndex, card.suit, index, i);
            }
        }
    });
}

// Function to create and animate cards for a player
function createCardForPlayer(cardIndex, suitIndex, seatIndex, cardPosition) {
    const card = document.createElement('div');
    card.classList.add('card');

    // Adjust card background position based on card index and suit
    const bgPosX = -(cardIndex * 81) + 'px';
    const bgPosY = -(suitIndex * 117) + 'px';
    card.style.backgroundPosition = `${bgPosX} ${bgPosY}`;
    
    // Starting position of the card (dealer's position)
    card.style.transform = `translate(800px, 175px) scale(1)`; // Full size card
    
    document.getElementById('table').appendChild(card);
    
    // Animate the card to the player's seat (resize to 0.75 size)
    setTimeout(() => {
        const targetX = seatPositions[seatIndex].x + (cardPosition * 50); // Offset cards slightly
        const targetY = seatPositions[seatIndex].y + 50; // Place below the profile icon
        card.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.75)`; // Resize to 0.75
    }, 100 * seatIndex + 50 * cardPosition); // Stagger the animation timing
}

// Event listeners for log-in and gender selection
document.getElementById('login-button').addEventListener('click', showOverlay);
document.getElementById('male').addEventListener('click', () => selectGender('male'));
document.getElementById('female').addEventListener('click', () => selectGender('female'));
document.getElementById('continue-button').addEventListener('click', validateLogin);

// Create seat elements dynamically based on seat positions
seatPositions.forEach((pos, index) => {
    const seat = document.createElement('div');
    seat.classList.add('seat');
    seat.id = `seat-${index}`; // Assign a unique ID for each seat
    seat.style.left = `${pos.x}px`;
    seat.style.top = `${pos.y}px`;

    // Initially show a locked seat if no one has logged in
    seat.innerHTML = `<img src="lock.png" class="seat-icon" />`;

    // Add click event for buying in
    seat.addEventListener('click', () => {
        if (!hasBoughtIn && selectedGender) {
            seat.innerHTML = '<div class="buy-in-text">BUY IN</div>'; // Display 'BUY IN' text
            buyIn(index); // Allow the user to buy in when they click their seat
        }
    });

    document.getElementById('table').appendChild(seat);
});
