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
    let Nplayers, NteamsPerRound, NplayersPerRound, NgamesPerRound, Ngames, gameDraft, gameScores, gameCourts;
    // Draft analysis
    const analysisTotal = document.getElementById('analysis-total');
    const analysisLeftOut = document.getElementById('analysis-leftout');
    const analysisGamesPerRound = document.getElementById('analysis-gamesPerRound');
    const analysisGamesTotal = document.getElementById('analysis-gamesTotal');
    const analysisProbSameTeam = document.getElementById('analysis-probSameTeam');
    const analysisProbSameGame = document.getElementById('analysis-probSameGame');
    const analysisMinRoundsGame = document.getElementById('analysis-minRoundsGame');
    const analysisMinRoundsTeam = document.getElementById('analysis-minRoundsTeam');
    const analysisDuplicateNames = document.getElementById('analysis-duplicateNames');

    // temp
    setupForm.elements["players-per-team"].value = 2;
    setupForm.elements["rounds"].value = 4;
    setupForm.elements["participants"].value = `Spencer, Rafael, Wayne, Trystan, Jovan, Susan, Charlie, Regan, Samaria, Yulisa, Bella, Jadah, Alyssia, Braeden, Savana, Auston, Nolan, Alfonso, Keelan, Erik, Bayley, Deonte, Janeth, Tyquan, Erich, Corrina, Trevin, Mayra, Cameryn, Maximus, Peter, Janie, Max, Kerry, Serena, Cristal, Ramon, Humberto, Corey, Ivan, Jaden, Phoenix, Montana, Karley, Destini, Tamia, Skyla, Avery`.split(', ').join('\n');

    // STAGE 2
    const gamesTableBody = document.querySelector('#games-table tbody');
    const highlightedPlayerSpan = document.getElementById('highlighted-player');
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
        let probPlayer = 1; let probTeam = 1; // Probability of always playing with different players
        for (let i= 0; i < N_ROUNDS; i++) {
            for (let k = 0; k < N_PLAYERS_PER_TEAM-1; k++) {
                probPlayer *= (Nplayers - ((N_PLAYERS_PER_TEAM-1)*i + k + 1) ) / (Nplayers - 1 - k);
            }
            for (let k = 0; k < 2*N_PLAYERS_PER_TEAM-1; k++) {
                probTeam *= (Nplayers - ((2*N_PLAYERS_PER_TEAM-1)*i + k + 1) ) / (Nplayers - 1 - k);
            }
        }
        analysisProbSameTeam.textContent = (100-100*probPlayer).toFixed(2);
        analysisProbSameGame.textContent = (100-100*probTeam).toFixed(2);
        analysisMinRoundsGame.textContent = Math.ceil((Nplayers-1) / (N_PLAYERS_PER_TEAM*2-1));
        if (N_PLAYERS_PER_TEAM === 1) { analysisMinRoundsTeam.textContent = "infinite"; }
        else { analysisMinRoundsTeam.textContent = Math.ceil((Nplayers-1) / (N_PLAYERS_PER_TEAM-1)); }
        
        // Count duplicate names
        const nameCounts = {};
        for (const participant of participants) {
            const trimmedName = participant.Name.trim();
            nameCounts[trimmedName] = (nameCounts[trimmedName] || 0) + 1;
        }
        const duplicateCount = Object.values(nameCounts).filter(count => count > 1).length;
        analysisDuplicateNames.textContent = duplicateCount;
        analysisDuplicateNames.style.color = duplicateCount === 0 ? 'green' : 'red';

        gameDraft = Array.from({ length: N_ROUNDS }, (_, i) => generateRoundRandom(i));
        gameScores = Array.from({ length: N_ROUNDS }, () => Array(NteamsPerRound).fill(null));
        gameCourts = Array.from({ length: N_ROUNDS }, () => Array(NgamesPerRound).fill(null));
        // gameScores = Array.from({ length: N_ROUNDS }, () => generateUniqueRandomIntegers(NteamsPerRound, 44));

        populateGamesTable();
        populateWinnersTable();
    }

    function generateRoundRandom(round) {
        return generateUniqueRandomIntegers(NteamsPerRound * N_PLAYERS_PER_TEAM, Nplayers - 1);
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
                    <td onclick="window.editCourt(${round}, ${gameId})" style="cursor: pointer;" class="court-cell">${court !== null ? court : '-'}</td>
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
                <td onclick="window.editCourtExtra(${i})" style="cursor: pointer;" class="court-cell">${extraMatch.court !== null ? extraMatch.court : '-'}</td>
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

        popup.innerHTML = `
            <h3>Enter Details for Game ${gameId}:</h3>
            <label>Court:</label>
            <input type="number" id="court-input" placeholder="Enter court number" value="${gameCourts[round][gameId] !== null ? gameCourts[round][gameId] : ''}" />
            <br><br>
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

        document.getElementById('ok-button').addEventListener('click', () => {
            const court = document.getElementById('court-input').value;
            const team1Score = document.getElementById('team1-score').value;
            const team2Score = document.getElementById('team2-score').value;

            if (court === '') {
                alert('Please enter a court number.');
                return;
            }
            document.body.removeChild(popup); document.body.removeChild(overlay);

            gameCourts[round][gameId] = parseInt(court);
            
            if (team1Score !== '' && team2Score !== '') {
                gameScores[round][gameId * 2] = parseInt(team1Score);
                gameScores[round][gameId * 2 + 1] = parseInt(team2Score);
                assignScores(); // Assign scores to participants based on the updated game scores
                populateWinnersTable(); // Refresh the winners table to show the new scores
            }
            
            populateGamesTable(); // Refresh the games table to show the new court
        });
        document.getElementById('cancel-button').addEventListener('click', () => {
            document.body.removeChild(popup); document.body.removeChild(overlay);
        });
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
        highlightedPlayerSpan.textContent = playerName;
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
        // Generate default placeholder
        const defaultPlaceholder = Array.from({length: N_PLAYERS_PER_TEAM}, (_, i) => `Name ${i + 1}`).join(', ');
        
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

        popup.innerHTML = `
            <h3>Add Extra Match</h3>
            <label>Team 1 Players:</label>
            <input type="text" id="add-team1" placeholder="${defaultPlaceholder}" />
            <br><br>
            <label>Team 2 Players:</label>
            <input type="text" id="add-team2" placeholder="${defaultPlaceholder}" />
            <br><br>
            <div style="display: flex; justify-content: center; gap: 10px;">
                <button id="add-ok-button" style="background-color: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Add</button>
                <button id="add-cancel-button" style="background-color: #f44336; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Cancel</button>
            </div>
        `;

        document.body.appendChild(popup);

        document.getElementById('add-ok-button').addEventListener('click', () => {
            const team1 = document.getElementById('add-team1').value.trim();
            const team2 = document.getElementById('add-team2').value.trim();

            if (team1 === '' || team2 === '') {
                alert('Please enter players for both teams.');
                return;
            }

            // Get participant names
            const participantNames = participants.map(p => p.Name);

            // Parse and validate team 1
            const team1Names = team1.split(',').map(name => name.trim());
            const invalidTeam1 = team1Names.filter(name => !participantNames.includes(name));

            // Parse and validate team 2
            const team2Names = team2.split(',').map(name => name.trim());
            const invalidTeam2 = team2Names.filter(name => !participantNames.includes(name));

            // Check for invalid names
            if (invalidTeam1.length > 0 || invalidTeam2.length > 0) {
                const allInvalid = [...invalidTeam1, ...invalidTeam2];
                alert(`The following names do not exist in the participant list:\n${allInvalid.join('\n')}`);
                return;
            }

            // Check for correct number of players in team 1
            if (team1Names.length !== N_PLAYERS_PER_TEAM) {
                alert(`Team 1 has ${team1Names.length} players, but it should have ${N_PLAYERS_PER_TEAM} players.`);
                return;
            }

            // Check for correct number of players in team 2
            if (team2Names.length !== N_PLAYERS_PER_TEAM) {
                alert(`Team 2 has ${team2Names.length} players, but it should have ${N_PLAYERS_PER_TEAM} players.`);
                return;
            }

            // Check for duplicate names in team 1
            const team1Duplicates = team1Names.filter((name, index) => team1Names.indexOf(name) !== index);
            if (team1Duplicates.length > 0) {
                alert(`Team 1 has duplicate players: ${[...new Set(team1Duplicates)].join(', ')}`);
                return;
            }

            // Check for duplicate names in team 2
            const team2Duplicates = team2Names.filter((name, index) => team2Names.indexOf(name) !== index);
            if (team2Duplicates.length > 0) {
                alert(`Team 2 has duplicate players: ${[...new Set(team2Duplicates)].join(', ')}`);
                return;
            }

            // Check for duplicate names across both teams
            const allTeamNames = [...team1Names, ...team2Names];
            const crossTeamDuplicates = allTeamNames.filter((name, index) => allTeamNames.indexOf(name) !== index);
            if (crossTeamDuplicates.length > 0) {
                alert(`The following players appear in both teams: ${[...new Set(crossTeamDuplicates)].join(', ')}`);
                return;
            }

            document.body.removeChild(popup);
            document.body.removeChild(overlay);

            extraMatches.push({
                team1: team1,
                team2: team2,
                court: null,
                team1Score: null,
                team2Score: null
            });

            populateGamesTable();
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

        popup.innerHTML = `
            <h3>Enter Details for Extra Match:</h3>
            <label>Court:</label>
            <input type="number" id="court-input" placeholder="Enter court number" value="${match.court !== null ? match.court : ''}" />
            <br><br>
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

        document.getElementById('ok-button').addEventListener('click', () => {
            const court = document.getElementById('court-input').value;
            const team1Score = document.getElementById('team1-score').value;
            const team2Score = document.getElementById('team2-score').value;

            if (court === '') {
                alert('Please enter a court number.');
                return;
            }

            document.body.removeChild(popup);
            document.body.removeChild(overlay);

            extraMatches[matchIndex].court = parseInt(court);

            if (team1Score !== '' && team2Score !== '') {
                extraMatches[matchIndex].team1Score = parseInt(team1Score);
                extraMatches[matchIndex].team2Score = parseInt(team2Score);
                assignScores(); // Assign scores to participants based on the updated game scores
                populateWinnersTable(); // Refresh the winners table to show the new scores
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