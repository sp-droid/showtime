document.addEventListener('DOMContentLoaded', () => {
    // OVERALL PAGE
    const stageButtons = {
        stage1: document.getElementById('stage-1-button'),
        stage2: document.getElementById('stage-2-button'),
        stage3: document.getElementById('stage-3-button')
    };

    const stages = {
        stage1: document.getElementById('stage-1'),
        stage2: document.getElementById('stage-2'),
        stage3: document.getElementById('stage-3')
    };

    function showStage(stageToShow) {
        Object.values(stages).forEach(stage => stage.style.display = 'none');
        stages[stageToShow].style.display = 'block';
    }

    stageButtons.stage1.addEventListener('click', () => showStage('stage1'));
    stageButtons.stage2.addEventListener('click', () => showStage('stage2'));
    stageButtons.stage3.addEventListener('click', () => showStage('stage3'));

    // STAGE 1
    const tournamentNameInput = document.getElementById('tournament-name');
    const pageTitle = document.querySelector('title');
    const displayedTitle = document.querySelector('header h1');

    tournamentNameInput.addEventListener('input', () => {
        const newName = tournamentNameInput.value || 'Tournament tool';
        pageTitle.textContent = newName;
        displayedTitle.textContent = newName;
    });
    
    // Listen for changes in the setup form
    const setupForm = document.getElementById('setup-form');
    let N_PLAYERS_PER_TEAM;
    let N_ROUNDS;
    let participants = [];
    setupForm.addEventListener('change', setupTournament);

    // Setup tournament
    let Nplayers, NteamsPerRound, NplayersPerRound, NgamesPerRound, Ngames, gameDraft, gameScores, gameCourts, pairingHistory;
    // Draft analysis
    const analysisTotal = document.getElementById('analysis-total');
    const analysisLeftOut = document.getElementById('analysis-leftout');
    const analysisGamesPerRound = document.getElementById('analysis-gamesPerRound');
    const analysisGamesTotal = document.getElementById('analysis-gamesTotal');
    const analysisDuplicateNames = document.getElementById('analysis-duplicateNames');

    // temp
    setupForm.elements["players-per-team"].value = 2;
    setupForm.elements["rounds"].value = 4;
    setupForm.elements["participants"].value = `Spencer, Rafael, Wayne, Trystan, Jovan, Susan, Charlie, Regan, Samaria, Yulisa, Bella, Jadah, Alyssia, Braeden, Savana, Auston, Nolan, Alfonso, Keelan, Erik, Bayley, Deonte, Janeth, Tyquan, Erich, Corrina, Trevin, Mayra, Cameryn, Maximus, Peter, Janie, Max, Kerry, Serena, Cristal, Ramon, Humberto, Corey, Ivan, Jaden, Phoenix, Montana, Karley, Destini, Tamia, Skyla, Avery`.split(', ').join('\n');

    // STAGE 2
    const gamesTableBody = document.querySelector('#games-table tbody');
    const highlightedPlayerSpan = document.getElementById('highlighted-player');
    const playsWithTeamSpan = document.getElementById('plays-with-team');
    const playsWithGameSpan = document.getElementById('plays-with-game');
    let currentHighlightedPlayer = null;
    let extraMatches = [];

    // Add Download CSV button before games table
    const gamesTable = document.getElementById('games-table');
    if (gamesTable) {
        const downloadBtn = document.createElement('button');
        downloadBtn.id = 'download-csv';
        downloadBtn.textContent = 'Download CSV';
        downloadBtn.style.backgroundColor = '#4CAF50';
        downloadBtn.style.color = 'white';
        downloadBtn.style.border = 'none';
        downloadBtn.style.padding = '10px 20px';
        downloadBtn.style.borderRadius = '5px';
        downloadBtn.style.cursor = 'pointer';
        downloadBtn.style.marginBottom = '10px';
        gamesTable.parentNode.insertBefore(downloadBtn, gamesTable);

        downloadBtn.addEventListener('click', () => {
            let csv = [];
            // Get headers
            const thead = gamesTable.querySelector('thead');
            if (thead) {
                const headers = Array.from(thead.querySelectorAll('th')).map(th => '"' + th.textContent.trim() + '"');
                csv.push(headers.join(';'));
            }
            // Get rows
            const rows = gamesTable.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const cols = Array.from(row.children).map((td, idx, arr) => {
                    let text = td.textContent.trim();
                    // If this is the last column (score), prefix with a single quote to prevent Excel date conversion
                    if (idx === arr.length - 1) {
                        text = "'" + text;
                    }
                    return '"' + text + '"';
                });
                csv.push(cols.join(';'));
            });
            // Download
            const csvContent = csv.join('\r\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'games_table.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });

        // Add "Add match" button
        const addMatchBtn = document.createElement('button');
        addMatchBtn.id = 'add-match';
        addMatchBtn.textContent = 'Add match';
        addMatchBtn.style.backgroundColor = '#ff9800';
        addMatchBtn.style.color = 'white';
        addMatchBtn.style.border = 'none';
        addMatchBtn.style.padding = '10px 20px';
        addMatchBtn.style.borderRadius = '5px';
        addMatchBtn.style.cursor = 'pointer';
        addMatchBtn.style.marginBottom = '10px';
        addMatchBtn.style.marginLeft = '10px';
        gamesTable.parentNode.insertBefore(addMatchBtn, gamesTable);

        addMatchBtn.addEventListener('click', () => {
            window.showAddMatchDialog();
        });
    }

    // STAGE 3
    const winnersTableBody = document.querySelector('#results-table tbody');

    // Add Download CSV button before results table
    const resultsTable = document.getElementById('results-table');
    if (resultsTable) {
        const downloadBtnResults = document.createElement('button');
        downloadBtnResults.id = 'download-csv-results';
        downloadBtnResults.textContent = 'Download CSV';
        downloadBtnResults.style.backgroundColor = '#4CAF50';
        downloadBtnResults.style.color = 'white';
        downloadBtnResults.style.border = 'none';
        downloadBtnResults.style.padding = '10px 20px';
        downloadBtnResults.style.borderRadius = '5px';
        downloadBtnResults.style.cursor = 'pointer';
        downloadBtnResults.style.marginBottom = '10px';
        resultsTable.parentNode.insertBefore(downloadBtnResults, resultsTable);

        downloadBtnResults.addEventListener('click', () => {
            let csv = [];
            // Get headers
            const thead = resultsTable.querySelector('thead');
            if (thead) {
                const headers = Array.from(thead.querySelectorAll('th')).map(th => '"' + th.textContent.trim() + '"');
                csv.push(headers.join(';'));
            }
            // Get rows
            const rows = resultsTable.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const cols = Array.from(row.children).map((td, idx, arr) => {
                    let text = td.textContent.trim();
                    return '"' + text + '"';
                });
                csv.push(cols.join(';'));
            });
            // Download
            const csvContent = csv.join('\r\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'results_table.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    // INITIALIZE
    showStage('stage1');
    setupTournament();
    
    // STAGE 1
    function setupTournament() {
        N_PLAYERS_PER_TEAM = parseInt(setupForm.elements['players-per-team'].value);
        N_ROUNDS = parseInt(setupForm.elements['rounds'].value);
        participants = setupForm.elements['participants'].value.split('\n').map(name => ({ Name: name.trim(), scores: [], finalScore: 0 }));
        if (participants.length <= 1) { return; }
        
        Nplayers = participants.length;
        NgamesPerRound = Math.floor(Nplayers/N_PLAYERS_PER_TEAM/2);
        NteamsPerRound = NgamesPerRound * 2;
        NplayersPerRound = NteamsPerRound * N_PLAYERS_PER_TEAM;
        Ngames = NgamesPerRound * N_ROUNDS;

        analysisTotal.textContent = Nplayers;
        analysisLeftOut.textContent = Nplayers-NplayersPerRound;
        analysisGamesPerRound.textContent = NgamesPerRound;
        analysisGamesTotal.textContent = Ngames;
        
        // Count duplicate names
        const nameCounts = {};
        for (const participant of participants) {
            const trimmedName = participant.Name.trim();
            nameCounts[trimmedName] = (nameCounts[trimmedName] || 0) + 1;
        }
        const duplicateCount = Object.values(nameCounts).filter(count => count > 1).length;
        analysisDuplicateNames.textContent = duplicateCount;
        analysisDuplicateNames.style.color = duplicateCount === 0 ? 'green' : 'red';

        const tournamentFormat = setupForm.elements['tournament-format'].value;
        if (tournamentFormat === '2') {
            // Swiss with optimized pairings
            initPairingHistory();
            gameDraft = [];
            for (let i = 0; i < N_ROUNDS; i++) {
                const roundDraft = generateRoundOptimized(i);
                gameDraft.push(roundDraft);
                updatePairingHistory(roundDraft);
            }
        } else {
            // Swiss with random pairings (default)
            gameDraft = Array.from({ length: N_ROUNDS }, (_, i) => generateRoundRandom(i));
            // Build pairing history for display
            initPairingHistory();
            for (let i = 0; i < N_ROUNDS; i++) {
                updatePairingHistory(gameDraft[i]);
            }
        }
        gameScores = Array.from({ length: N_ROUNDS }, () => Array(NteamsPerRound).fill(null));
        gameCourts = Array.from({ length: N_ROUNDS }, () => Array(NgamesPerRound).fill(null));
        // gameScores = Array.from({ length: N_ROUNDS }, () => generateUniqueRandomIntegers(NteamsPerRound, 44));

        populateGamesTable();
        populateWinnersTable();
    }

    function generateRoundRandom(round) {
        return generateUniqueRandomIntegers(NteamsPerRound * N_PLAYERS_PER_TEAM, Nplayers - 1);
    }

    // Pairing history tracking for optimized pairings
    function initPairingHistory() {
        pairingHistory = {
            sameGame: Array.from({ length: Nplayers }, () => new Map()),
            sameTeam: Array.from({ length: Nplayers }, () => new Map())
        };
    }

    function updatePairingHistory(roundDraft) {
        for (let gameId = 0; gameId < NgamesPerRound; gameId++) {
            const team1 = roundDraft.slice(gameId * N_PLAYERS_PER_TEAM * 2, (gameId + 0.5) * N_PLAYERS_PER_TEAM * 2);
            const team2 = roundDraft.slice((gameId + 0.5) * N_PLAYERS_PER_TEAM * 2, (gameId + 1) * N_PLAYERS_PER_TEAM * 2);

            // Record same-game pairs (all players in this game)
            const allPlayers = [...team1, ...team2];
            for (let i = 0; i < allPlayers.length; i++) {
                for (let j = i + 1; j < allPlayers.length; j++) {
                    const a = allPlayers[i], b = allPlayers[j];
                    pairingHistory.sameGame[a].set(b, (pairingHistory.sameGame[a].get(b) || 0) + 1);
                    pairingHistory.sameGame[b].set(a, (pairingHistory.sameGame[b].get(a) || 0) + 1);
                }
            }

            // Record same-team pairs (within each team)
            for (const team of [team1, team2]) {
                for (let i = 0; i < team.length; i++) {
                    for (let j = i + 1; j < team.length; j++) {
                        const a = team[i], b = team[j];
                        pairingHistory.sameTeam[a].set(b, (pairingHistory.sameTeam[a].get(b) || 0) + 1);
                        pairingHistory.sameTeam[b].set(a, (pairingHistory.sameTeam[b].get(a) || 0) + 1);
                    }
                }
            }
        }
    }

    function updatePairingHistoryFromTeams(team1Ids, team2Ids) {
        if (!pairingHistory) return;

        // Same-game pairs (all players in this match)
        const allPlayers = [...team1Ids, ...team2Ids];
        for (let i = 0; i < allPlayers.length; i++) {
            for (let j = i + 1; j < allPlayers.length; j++) {
                const a = allPlayers[i], b = allPlayers[j];
                pairingHistory.sameGame[a].set(b, (pairingHistory.sameGame[a].get(b) || 0) + 1);
                pairingHistory.sameGame[b].set(a, (pairingHistory.sameGame[b].get(a) || 0) + 1);
            }
        }

        // Same-team pairs (within each team)
        for (const team of [team1Ids, team2Ids]) {
            for (let i = 0; i < team.length; i++) {
                for (let j = i + 1; j < team.length; j++) {
                    const a = team[i], b = team[j];
                    pairingHistory.sameTeam[a].set(b, (pairingHistory.sameTeam[a].get(b) || 0) + 1);
                    pairingHistory.sameTeam[b].set(a, (pairingHistory.sameTeam[b].get(a) || 0) + 1);
                }
            }
        }
    }

    function removePairingHistoryForRound(roundDraft) {
        if (!pairingHistory) return;
        for (let gameId = 0; gameId < NgamesPerRound; gameId++) {
            const team1 = roundDraft.slice(gameId * N_PLAYERS_PER_TEAM * 2, (gameId + 0.5) * N_PLAYERS_PER_TEAM * 2);
            const team2 = roundDraft.slice((gameId + 0.5) * N_PLAYERS_PER_TEAM * 2, (gameId + 1) * N_PLAYERS_PER_TEAM * 2);

            const allPlayers = [...team1, ...team2];
            for (let i = 0; i < allPlayers.length; i++) {
                for (let j = i + 1; j < allPlayers.length; j++) {
                    const a = allPlayers[i], b = allPlayers[j];
                    const prevA = pairingHistory.sameGame[a].get(b) || 0;
                    if (prevA <= 1) pairingHistory.sameGame[a].delete(b); else pairingHistory.sameGame[a].set(b, prevA - 1);
                    const prevB = pairingHistory.sameGame[b].get(a) || 0;
                    if (prevB <= 1) pairingHistory.sameGame[b].delete(a); else pairingHistory.sameGame[b].set(a, prevB - 1);
                }
            }

            for (const team of [team1, team2]) {
                for (let i = 0; i < team.length; i++) {
                    for (let j = i + 1; j < team.length; j++) {
                        const a = team[i], b = team[j];
                        const prevA = pairingHistory.sameTeam[a].get(b) || 0;
                        if (prevA <= 1) pairingHistory.sameTeam[a].delete(b); else pairingHistory.sameTeam[a].set(b, prevA - 1);
                        const prevB = pairingHistory.sameTeam[b].get(a) || 0;
                        if (prevB <= 1) pairingHistory.sameTeam[b].delete(a); else pairingHistory.sameTeam[b].set(a, prevB - 1);
                    }
                }
            }
        }
    }

    function calculateRoundScore(proposedRound, pairingHistory) {
        let score = 0;
        for (let gameId = 0; gameId < NgamesPerRound; gameId++) {
            const team1 = proposedRound.slice(gameId * N_PLAYERS_PER_TEAM * 2, (gameId + 0.5) * N_PLAYERS_PER_TEAM * 2);
            const team2 = proposedRound.slice((gameId + 0.5) * N_PLAYERS_PER_TEAM * 2, (gameId + 1) * N_PLAYERS_PER_TEAM * 2);
            const allPlayers = [...team1, ...team2];

            // +5 for each repeated same-game pair
            for (let i = 0; i < allPlayers.length; i++) {
                for (let j = i + 1; j < allPlayers.length; j++) {
                    if (pairingHistory.sameGame[allPlayers[i]].has(allPlayers[j])) {
                        score += 5;
                    }
                }
            }

            // +10 for each repeated same-team pair
            for (const team of [team1, team2]) {
                for (let i = 0; i < team.length; i++) {
                    for (let j = i + 1; j < team.length; j++) {
                        if (pairingHistory.sameTeam[team[i]].has(team[j])) {
                            score += 10;
                        }
                    }
                }
            }
        }
        return score;
    }

    function generateRoundOptimized(round) {
        const TRIALS = 100;
        let bestRound = null;
        let bestScore = Infinity;

        for (let trial = 0; trial < TRIALS; trial++) {
            const candidate = generateUniqueRandomIntegers(NteamsPerRound * N_PLAYERS_PER_TEAM, Nplayers - 1);
            const trialScore = calculateRoundScore(candidate, pairingHistory);
            if (trialScore < bestScore) {
                bestScore = trialScore;
                bestRound = candidate;
            }
        }

        return bestRound;
    }

    // STAGE 2
    function populateGamesTable() {
        const colors = ['#FF6666', '#66FF66', '#6666FF', '#FFFF66', '#66FFFF', '#FF66FF'];
        gamesTableBody.innerHTML = ''; // Clear previous rows

        for (let round = 0; round < N_ROUNDS; round++) {
            const roundColor = colors[round % colors.length];

            for (let gameId = 0; gameId < NgamesPerRound; gameId++) {
                const completeGameId = round * NgamesPerRound + gameId;
                const team1Players = gameDraft[round].slice(gameId * N_PLAYERS_PER_TEAM * 2, (gameId + 0.5) * N_PLAYERS_PER_TEAM * 2);
                const team2Players = gameDraft[round].slice((gameId + 0.5) * N_PLAYERS_PER_TEAM * 2, (gameId + 1) * N_PLAYERS_PER_TEAM * 2);
                const team1Score = gameScores[round][gameId * 2];
                const team2Score = gameScores[round][gameId * 2 + 1];
                const court = gameCourts[round][gameId];

                let score;
                if (team1Score === null) {
                    if (court === null) {
                        score = `<span class="introduceResult" style="color: rgb(0, 0, 238);" onclick="window.introduceResult(${round}, ${gameId})">Pending</span>`;
                    } else {
                        score = `<span class="introduceResult playing-status" onclick="window.introduceResult(${round}, ${gameId})">Playing</span>`;
                    }
                } else {
                    score = `<span class="introduceResult" style="color: rgb(0, 120, 150);" onclick="window.introduceResult(${round}, ${gameId})">${team1Score} - ${team2Score}</span>`;
                }

                const row = document.createElement('tr');
                row.style.backgroundColor = roundColor; // Apply round color

                row.innerHTML = `
                    <td>${completeGameId + 1}</td>
                    <td>${round + 1}</td>
                    <td class="court-cell">${court !== null ? court : '-'}</td>
                    <td>${team1Players.map(playerId => participants[playerId].Name).join(', ')}</td>
                    <td>${team2Players.map(playerId => participants[playerId].Name).join(', ')}</td>
                    <td>${score}</td>
                `;

                gamesTableBody.appendChild(row);
            }
        }

        // Add extra matches
        const lastGameId = Ngames;
        for (let i = 0; i < extraMatches.length; i++) {
            const extraMatch = extraMatches[i];
            const completeGameId = lastGameId + i + 1;
            const extraColor = '#E8E8E8'; // Light gray for extra matches

            let score;
            if (extraMatch.team1Score === null) {
                if (extraMatch.court === null) {
                    score = `<span class="introduceResult" style="color: rgb(0, 0, 238);" onclick="window.introduceResultExtra(${i})">Pending</span>`;
                } else {
                    score = `<span class="introduceResult playing-status" onclick="window.introduceResultExtra(${i})">Playing</span>`;
                }
            } else {
                score = `<span class="introduceResult" style="color: rgb(0, 120, 150);" onclick="window.introduceResultExtra(${i})">${extraMatch.team1Score} - ${extraMatch.team2Score}</span>`;
            }

            const row = document.createElement('tr');
            row.style.backgroundColor = extraColor;

            row.innerHTML = `
                <td>${completeGameId}</td>
                <td>Extra</td>
                <td class="court-cell">${extraMatch.court !== null ? extraMatch.court : '-'}</td>
                <td>${extraMatch.team1}</td>
                <td>${extraMatch.team2}</td>
                <td>${score}</td>
            `;

            gamesTableBody.appendChild(row);
        }

        addPlayerClickHighlight();
        
        // Restore or set default highlighting
        if (currentHighlightedPlayer) {
            highlightGames(currentHighlightedPlayer);
        } else if (gameDraft[0].length > 0) {
            const firstPlayerName = participants[gameDraft[0][0]].Name;
            highlightGames(firstPlayerName);
        }
    }

    window.editCourt = function(round, gameId) {
        window.introduceResult(round, gameId);
    }

    function refreshIntroduceResultPopup(round, gameId, oldPopup, overlay) {
        // Rebuild the popup content in-place to reflect swapped names
        const initialCourt = gameCourts[round][gameId] !== null ? gameCourts[round][gameId] : 1;
        const team1PlayerIds = gameDraft[round].slice(gameId * N_PLAYERS_PER_TEAM, gameId * N_PLAYERS_PER_TEAM + N_PLAYERS_PER_TEAM);
        const team2PlayerIds = gameDraft[round].slice(gameId * N_PLAYERS_PER_TEAM + N_PLAYERS_PER_TEAM, gameId * N_PLAYERS_PER_TEAM + 2 * N_PLAYERS_PER_TEAM);

        const team1NamesHtml = team1PlayerIds.map(id =>
            `<span class="swap-player" data-player="${id}" data-team="0" style="cursor:pointer;color:rgb(0,0,238);text-decoration:underline;">${participants[id].Name}</span>`
        ).join(', ');
        const team2NamesHtml = team2PlayerIds.map(id =>
            `<span class="swap-player" data-player="${id}" data-team="1" style="cursor:pointer;color:rgb(0,0,238);text-decoration:underline;">${participants[id].Name}</span>`
        ).join(', ');

        oldPopup.innerHTML = `
            <h3>Enter results for game ${gameId}</h3>
            <label>Court:</label>
            <div style="display: flex; align-items: center; gap: 8px; margin: 5px 0;">
                <button id="court-minus" style="width: 32px; height: 32px; font-size: 18px; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; background: #f0f0f0;">−</button>
                <span id="court-display" style="min-width: 30px; text-align: center; font-size: 16px; font-weight: bold;">${initialCourt}</span>
                <button id="court-plus" style="width: 32px; height: 32px; font-size: 18px; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; background: #f0f0f0;">+</button>
            </div>
            <br>
            <label>Team 1 score:</label>
            <input type="number" id="team1-score" placeholder="Enter score" value="${gameScores[round][gameId * 2] !== null ? gameScores[round][gameId * 2] : ''}" />
            <div style="font-size: 13px; color: #555; margin: 2px 0 8px 0;">${team1NamesHtml}</div>
            <label>Team 2 score:</label>
            <input type="number" id="team2-score" placeholder="Enter score" value="${gameScores[round][gameId * 2 + 1] !== null ? gameScores[round][gameId * 2 + 1] : ''}" />
            <div style="font-size: 13px; color: #555; margin: 2px 0 8px 0;">${team2NamesHtml}</div>
            <br>
            <div style="display: flex; justify-content: center; gap: 10px;">
                <button id="ok-button" style="background-color: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Update</button>
                <button id="cancel-button" style="background-color: #f44336; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Cancel</button>
            </div>
        `;

        // Re-attach event listeners
        attachIntroduceResultEvents(round, gameId, oldPopup, overlay);
    }

    function attachIntroduceResultEvents(round, gameId, popup, overlay) {
        let courtValue = gameCourts[round][gameId] !== null ? gameCourts[round][gameId] : 1;
        document.getElementById('court-plus').addEventListener('click', () => {
            courtValue++;
            document.getElementById('court-display').textContent = courtValue;
        });
        document.getElementById('court-minus').addEventListener('click', () => {
            if (courtValue > 1) courtValue--;
            document.getElementById('court-display').textContent = courtValue;
        });

        document.getElementById('ok-button').addEventListener('click', () => {
            const team1Score = document.getElementById('team1-score').value;
            const team2Score = document.getElementById('team2-score').value;

            document.body.removeChild(popup); document.body.removeChild(overlay);

            gameCourts[round][gameId] = courtValue;
            
            if (team1Score !== '' && team2Score !== '') {
                gameScores[round][gameId * 2] = parseInt(team1Score);
                gameScores[round][gameId * 2 + 1] = parseInt(team2Score);
                assignScores();
                populateWinnersTable();
            }
            
            populateGamesTable();
        });
        document.getElementById('cancel-button').addEventListener('click', () => {
            // Revert any swap that happened
            if (popup._originalRoundDraft) {
                const currentDraft = gameDraft[round];
                let swapped = false;
                for (let i = 0; i < currentDraft.length; i++) {
                    if (currentDraft[i] !== popup._originalRoundDraft[i]) {
                        swapped = true;
                        break;
                    }
                }
                if (swapped) {
                    removePairingHistoryForRound(currentDraft);
                    gameDraft[round] = [...popup._originalRoundDraft];
                    updatePairingHistory(gameDraft[round]);
                }
            }
            document.body.removeChild(popup); document.body.removeChild(overlay);
        });

        // Attach swap click handlers
        document.querySelectorAll('.swap-player').forEach(el => {
            el.addEventListener('click', () => {
                const clickedPlayerId = parseInt(el.dataset.player);
                const teamIndex = parseInt(el.dataset.team); // 0 = team1, 1 = team2
                showSwapPopup(round, gameId, popup, overlay, clickedPlayerId, teamIndex);
            });
        });
    }

    function showSwapPopup(round, gameId, mainPopup, mainOverlay, clickedPlayerId, teamIndex) {
        const team1PlayerIds = gameDraft[round].slice(gameId * N_PLAYERS_PER_TEAM, gameId * N_PLAYERS_PER_TEAM + N_PLAYERS_PER_TEAM);
        const team2PlayerIds = gameDraft[round].slice(gameId * N_PLAYERS_PER_TEAM + N_PLAYERS_PER_TEAM, gameId * N_PLAYERS_PER_TEAM + 2 * N_PLAYERS_PER_TEAM);
        const otherTeamIds = teamIndex === 0 ? team2PlayerIds : team1PlayerIds;

        const swapOverlay = document.createElement('div');
        swapOverlay.style.position = 'fixed';
        swapOverlay.style.top = '0';
        swapOverlay.style.left = '0';
        swapOverlay.style.width = '100%';
        swapOverlay.style.height = '100%';
        swapOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        swapOverlay.style.zIndex = '1001';
        document.body.appendChild(swapOverlay);

        const swapPopup = document.createElement('div');
        swapPopup.style.position = 'fixed';
        swapPopup.style.top = '50%';
        swapPopup.style.left = '50%';
        swapPopup.style.transform = 'translate(-50%, -50%)';
        swapPopup.style.backgroundColor = '#fff';
        swapPopup.style.padding = '20px';
        swapPopup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
        swapPopup.style.zIndex = '1002';
        swapPopup.style.minWidth = '250px';

        const otherTeamOptions = otherTeamIds.map(id =>
            `<div style="padding:6px 10px;cursor:pointer;color:rgb(0,0,238);border-bottom:1px solid #eee;" class="swap-option" data-target="${id}">${participants[id].Name}</div>`
        ).join('');

        swapPopup.innerHTML = `
            <h3 style="margin-top:0;">Swap ${participants[clickedPlayerId].Name}</h3>
            <p style="margin:8px 0;font-size:14px;">Choose a player from the other team to swap with:</p>
            ${otherTeamOptions}
            <div style="margin-top:12px;text-align:center;">
                <button id="cancel-swap-button" style="background-color:#f44336;color:white;border:none;padding:8px 20px;border-radius:5px;cursor:pointer;">Cancel</button>
            </div>
        `;

        document.body.appendChild(swapPopup);

        // Attach swap option clicks
        swapPopup.querySelectorAll('.swap-option').forEach(el => {
            el.addEventListener('click', () => {
                const targetPlayerId = parseInt(el.dataset.target);

                // Perform the swap in gameDraft
                const team1Ids = gameDraft[round].slice(gameId * N_PLAYERS_PER_TEAM, gameId * N_PLAYERS_PER_TEAM + N_PLAYERS_PER_TEAM);
                const team2Ids = gameDraft[round].slice(gameId * N_PLAYERS_PER_TEAM + N_PLAYERS_PER_TEAM, gameId * N_PLAYERS_PER_TEAM + 2 * N_PLAYERS_PER_TEAM);

                // Build the full round draft for this round to update pairing history
                const oldRoundDraft = [...gameDraft[round]];

                // Remove old pairing history for this round
                removePairingHistoryForRound(oldRoundDraft);

                // Swap the two players in gameDraft
                const clickedIdx = gameDraft[round].indexOf(clickedPlayerId);
                const targetIdx = gameDraft[round].indexOf(targetPlayerId);
                if (clickedIdx !== -1 && targetIdx !== -1) {
                    gameDraft[round][clickedIdx] = targetPlayerId;
                    gameDraft[round][targetIdx] = clickedPlayerId;
                }

                // Add new pairing history for this round
                updatePairingHistory(gameDraft[round]);

                // Close swap popup
                document.body.removeChild(swapPopup);
                document.body.removeChild(swapOverlay);

                // Refresh the main popup
                refreshIntroduceResultPopup(round, gameId, mainPopup, mainOverlay);
            });
        });

        document.getElementById('cancel-swap-button').addEventListener('click', () => {
            document.body.removeChild(swapPopup);
            document.body.removeChild(swapOverlay);
        });
    }

    window.introduceResult = function(round, gameId) {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '999';
        document.body.appendChild(overlay);
        
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = '#fff';
        popup.style.padding = '20px';
        popup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
        popup.style.zIndex = '1000';

        // Save original round draft so we can revert swaps on cancel
        popup._originalRoundDraft = [...gameDraft[round]];
        document.body.appendChild(popup);
        refreshIntroduceResultPopup(round, gameId, popup, overlay);
    }
    function assignScores() {
        for (const participant of participants) {
            participant.scores = []; // Reset scores for each participant
        }
        for (let round = 0; round < N_ROUNDS; round++) {
            for (let i = 0; i < NteamsPerRound*N_PLAYERS_PER_TEAM; i++) {
                const playerId = gameDraft[round][i]
                const score = gameScores[round][Math.floor(i / N_PLAYERS_PER_TEAM)];
                if (score !== null) { participants[playerId]["scores"].push(score); }
            }
        }

        // Add scores from extra matches
        for (let i = 0; i < extraMatches.length; i++) {
            const extraMatch = extraMatches[i];
            
            // Process team 1
            if (extraMatch.team1Score !== null) {
                const team1Players = extraMatch.team1.split(',').map(name => name.trim());
                for (const playerName of team1Players) {
                    const participant = participants.find(p => p.Name === playerName);
                    if (participant) {
                        participant.scores.push(extraMatch.team1Score);
                    }
                }
            }

            // Process team 2
            if (extraMatch.team2Score !== null) {
                const team2Players = extraMatch.team2.split(',').map(name => name.trim());
                for (const playerName of team2Players) {
                    const participant = participants.find(p => p.Name === playerName);
                    if (participant) {
                        participant.scores.push(extraMatch.team2Score);
                    }
                }
            }
        }
    }

    function addPlayerClickHighlight() {
        const rows = document.querySelectorAll('#games-table tbody tr');

        rows.forEach(row => {
            const team1Cell = row.children[3];
            const team2Cell = row.children[4];

            [team1Cell, team2Cell].forEach(cell => {
                const players = cell.textContent.split(', ');
                cell.innerHTML = ''; // Clear the cell content

                players.forEach((player, index) => {
                    const span = document.createElement('span');
                    span.textContent = player;
                    span.style.cursor = 'pointer';
                    span.addEventListener('click', () => {
                        removeHighlight();
                        highlightGames(player);
                    });
                    cell.appendChild(span);

                    if (index < players.length - 1) {
                        cell.appendChild(document.createTextNode(', '));
                    }
                });
            });
        });
    }

    function highlightGames(playerName) {
        currentHighlightedPlayer = playerName;

        // Count total games this player participated in
        const playerId = participants.findIndex(p => p.Name === playerName);
        let totalGames = 0;
        if (playerId !== -1) {
            for (let round = 0; round < N_ROUNDS; round++) {
                if (gameDraft[round].includes(playerId)) totalGames++;
            }
        }
        highlightedPlayerSpan.textContent = `${playerName} (x${totalGames})`;

        // Update plays-with display
        if (playerId !== -1 && pairingHistory) {
            // Same team
            const teamMap = pairingHistory.sameTeam[playerId];
            if (teamMap && teamMap.size > 0) {
                const entries = [];
                for (const [otherId, count] of teamMap) {
                    const name = participants[otherId].Name;
                    entries.push(count > 1 ? `${name} (x${count})` : name);
                }
                playsWithTeamSpan.textContent = [...entries].sort((a, b) => a.localeCompare(b)).join(', ');
            } else {
                playsWithTeamSpan.textContent = '-';
            }

            // Same game
            const gameMap = pairingHistory.sameGame[playerId];
            if (gameMap && gameMap.size > 0) {
                const entries = [];
                for (const [otherId, count] of gameMap) {
                    const name = participants[otherId].Name;
                    entries.push(count > 1 ? `${name} (x${count})` : name);
                }
                playsWithGameSpan.textContent = [...entries].sort((a, b) => a.localeCompare(b)).join(', ');
            } else {
                playsWithGameSpan.textContent = '-';
            }
        } else {
            playsWithTeamSpan.textContent = '-';
            playsWithGameSpan.textContent = '-';
        }

        const rows = document.querySelectorAll('#games-table tbody tr');
        rows.forEach(row => {
            const team1Players = row.children[3].querySelectorAll('span');
            const team2Players = row.children[4].querySelectorAll('span');

            const team1Names = Array.from(team1Players).map(span => span.textContent);
            const team2Names = Array.from(team2Players).map(span => span.textContent);

            if (team1Names.includes(playerName) || team2Names.includes(playerName)) {
                row.style.fontWeight = 'bold';
            }
        });
    }

    function removeHighlight() {
        const rows = document.querySelectorAll('#games-table tbody tr');
        rows.forEach(row => {
            row.style.fontWeight = '';
        });
    }

    window.showAddMatchDialog = function() {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '999';
        document.body.appendChild(overlay);
        
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = '#fff';
        popup.style.padding = '20px';
        popup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
        popup.style.zIndex = '1000';
        popup.style.minWidth = '500px';

        const sortedParticipants = participants
            .map((p, i) => ({ id: i, name: p.Name }))
            .sort((a, b) => a.name.localeCompare(b.name));
        const optionsHtml = sortedParticipants.map(({id, name}) => `<option value="${id}">${name}</option>`).join('');

        popup.innerHTML = `
            <h3>Add Extra Match</h3>
            <div style="display: flex; gap: 20px; margin-bottom: 15px;">
                <div style="flex: 1;">
                    <strong>Team 1</strong>
                    <div id="team1-players" style="min-height: 40px; border: 1px solid #ccc; padding: 5px; margin: 5px 0; border-radius: 4px;"><em>No players selected</em></div>
                    <select id="team1-select" style="width: 100%; margin-bottom: 5px;">
                        <option value="">-- Select player --</option>
                        ${optionsHtml}
                    </select>
                    <span id="team1-count" style="margin-left: 10px;">0 / ${N_PLAYERS_PER_TEAM}</span>
                </div>
                <div style="flex: 1;">
                    <strong>Team 2</strong>
                    <div id="team2-players" style="min-height: 40px; border: 1px solid #ccc; padding: 5px; margin: 5px 0; border-radius: 4px;"><em>No players selected</em></div>
                    <select id="team2-select" style="width: 100%; margin-bottom: 5px;">
                        <option value="">-- Select player --</option>
                        ${optionsHtml}
                    </select>
                    <span id="team2-count" style="margin-left: 10px;">0 / ${N_PLAYERS_PER_TEAM}</span>
                </div>
            </div>
            <div style="display: flex; justify-content: center; gap: 10px;">
                <button id="add-ok-button" disabled style="background-color: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Add</button>
                <button id="add-cancel-button" style="background-color: #f44336; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Cancel</button>
            </div>
        `;

        document.body.appendChild(popup);

        const team1Selected = [];
        const team2Selected = [];

        function removeOptionFromSelects(playerId) {
            const s1 = document.getElementById('team1-select');
            const s2 = document.getElementById('team2-select');
            const opt1 = s1.querySelector(`option[value="${playerId}"]`);
            const opt2 = s2.querySelector(`option[value="${playerId}"]`);
            if (opt1) opt1.remove();
            if (opt2) opt2.remove();
        }

        function updateTeamDisplay(teamNum) {
            const selected = teamNum === 1 ? team1Selected : team2Selected;
            const playersDiv = document.getElementById(`team${teamNum}-players`);
            const select = document.getElementById(`team${teamNum}-select`);
            const countSpan = document.getElementById(`team${teamNum}-count`);
            const full = selected.length >= N_PLAYERS_PER_TEAM;

            playersDiv.innerHTML = selected.length > 0
                ? selected.map(id => participants[id].Name).join(', ')
                : '<em>No players selected</em>';

            countSpan.textContent = `${selected.length} / ${N_PLAYERS_PER_TEAM}`;
            select.disabled = full;
            select.style.opacity = full ? '0.5' : '1';

            document.getElementById('add-ok-button').disabled =
                team1Selected.length < N_PLAYERS_PER_TEAM || team2Selected.length < N_PLAYERS_PER_TEAM;
        }

        function addPlayerToTeam(teamNum) {
            const select = document.getElementById(`team${teamNum}-select`);
            const playerId = parseInt(select.value);
            if (isNaN(playerId)) return;

            const selected = teamNum === 1 ? team1Selected : team2Selected;
            const otherSelected = teamNum === 1 ? team2Selected : team1Selected;

            if (selected.includes(playerId) || otherSelected.includes(playerId)) return;

            selected.push(playerId);
            removeOptionFromSelects(playerId);
            select.value = '';
            updateTeamDisplay(teamNum);
        }

        document.getElementById('team1-select').addEventListener('change', function() { addPlayerToTeam(1); });
        document.getElementById('team2-select').addEventListener('change', function() { addPlayerToTeam(2); });

        document.getElementById('add-ok-button').addEventListener('click', () => {
            const team1 = team1Selected.map(id => participants[id].Name).join(', ');
            const team2 = team2Selected.map(id => participants[id].Name).join(', ');

            document.body.removeChild(popup);
            document.body.removeChild(overlay);

            extraMatches.push({
                team1: team1,
                team2: team2,
                court: null,
                team1Score: null,
                team2Score: null
            });

            // Update pairing history with the new match
            if (pairingHistory) {
                updatePairingHistoryFromTeams(team1Selected, team2Selected);
            }

            populateGamesTable();

            // Refresh the plays-with display if a player is highlighted
            if (currentHighlightedPlayer) {
                highlightGames(currentHighlightedPlayer);
            }
        });

        document.getElementById('add-cancel-button').addEventListener('click', () => {
            document.body.removeChild(popup);
            document.body.removeChild(overlay);
        });
    };

    window.editCourtExtra = function(matchIndex) {
        window.introduceResultExtra(matchIndex);
    };

    window.introduceResultExtra = function(matchIndex) {
        const match = extraMatches[matchIndex];
        
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '999';
        document.body.appendChild(overlay);
        
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = '#fff';
        popup.style.padding = '20px';
        popup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
        popup.style.zIndex = '1000';

        const initialCourt = match.court !== null ? match.court : 1;

        popup.innerHTML = `
            <h3>Enter Details for Extra Match:</h3>
            <label>Court:</label>
            <div style="display: flex; align-items: center; gap: 8px; margin: 5px 0;">
                <button id="court-minus" style="width: 32px; height: 32px; font-size: 18px; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; background: #f0f0f0;">−</button>
                <span id="court-display" style="min-width: 30px; text-align: center; font-size: 16px; font-weight: bold;">${initialCourt}</span>
                <button id="court-plus" style="width: 32px; height: 32px; font-size: 18px; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; background: #f0f0f0;">+</button>
            </div>
            <br>
            <label>Team 1 score:</label>
            <input type="number" id="team1-score" placeholder="Enter score" />
            <br><br>
            <label>Team 2 score:</label>
            <input type="number" id="team2-score" placeholder="Enter score" />
            <br><br>
            <div style="display: flex; justify-content: center; gap: 10px;">
                <button id="ok-button" style="background-color: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Update</button>
                <button id="cancel-button" style="background-color: #f44336; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Cancel</button>
            </div>
        `;

        document.body.appendChild(popup);

        let courtValue = initialCourt;
        document.getElementById('court-plus').addEventListener('click', () => {
            courtValue++;
            document.getElementById('court-display').textContent = courtValue;
        });
        document.getElementById('court-minus').addEventListener('click', () => {
            if (courtValue > 1) courtValue--;
            document.getElementById('court-display').textContent = courtValue;
        });

        document.getElementById('ok-button').addEventListener('click', () => {
            const team1Score = document.getElementById('team1-score').value;
            const team2Score = document.getElementById('team2-score').value;

            document.body.removeChild(popup);
            document.body.removeChild(overlay);

            extraMatches[matchIndex].court = courtValue;

            if (team1Score !== '' && team2Score !== '') {
                extraMatches[matchIndex].team1Score = parseInt(team1Score);
                extraMatches[matchIndex].team2Score = parseInt(team2Score);
                assignScores();
                populateWinnersTable();
            }

            populateGamesTable();
        });

        document.getElementById('cancel-button').addEventListener('click', () => {
            document.body.removeChild(popup);
            document.body.removeChild(overlay);
        });
    };

    // STAGE 3
    function populateWinnersTable() {
        winnersTableBody.innerHTML = ''; // Clear previous rows

        const finalScores = participants.map((participant, index) => {
            let totalScore;
            let averageScore;
            if (participant.scores.length === 0) {
                totalScore = 0;
                averageScore = 0;
            } else {
                totalScore = participant.scores.reduce((sum, score) => sum + score, 0);
                averageScore = totalScore / participant.scores.length; // Calculate average score
            }
            return { Name: participant.Name, Results: participant.scores, GamesPlayed: participant.scores.length, Total: totalScore, Average: averageScore };
        });

        finalScores.sort((a, b) => b.Average - a.Average); // Sort by average score descending

        finalScores.forEach((participant, rank) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${rank + 1}</td>
                <td>${participant.Name}</td>
                <td>${participant.Results.join(', ')}</td>
                <td>${participant.GamesPlayed}</td>
                <td>${participant.Total}</td>
                <td>${participant.Average}</td>
            `;
            if (rank === 0) {
                row.classList.add('rank-1');
            } else if (rank === 1) {
                row.classList.add('rank-2');
            } else if (rank === 2) {
                row.classList.add('rank-3');
            }
            winnersTableBody.appendChild(row);
        });
    }
});

function generateUniqueRandomIntegers(Ngenerated, maxValue) {
    if (Ngenerated > maxValue + 1) {
        throw new Error("Ngenerated cannot be greater than maxValue + 1.");
    }

    const result = new Set(); // Use a Set to ensure uniqueness
    while (result.size < Ngenerated) {
        const randomInt = Math.floor(Math.random() * (maxValue + 1)); // Random integer between 0 and N
        result.add(randomInt);
    }

    return Array.from(result); // Convert the Set to an array
}