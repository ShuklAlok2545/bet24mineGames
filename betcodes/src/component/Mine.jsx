import "./Mine.css";
import { useState, useEffect } from "react";
import blastSound from "../sound/boomsound.mp3";
import clickSound from "../sound/click.mp3";

const Mine = () => {
    
    const TOTAL_MINES = 25;
    const [blastMineCount, setBlastMineCount] = useState(0);
    const [cellCheck, setCellCheck] = useState(Array(25).fill(false));
    const [minePositions, setMinePositions] = useState([]);
    const [blastMines, setBlastMines] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [betPlaced, setBetPlaced] = useState(false);
    const [cashedOut, setCashedOut] = useState(false);
    const [Total_amount, setTotalamount] = useState(5000);
    const [betAmount, setbetAmount] = useState('');
    const [successfulClicks, setSuccessfulClicks] = useState(0);
    const [profitMultiplier, setProfitMultiplier] = useState(0);
    const [firstblastindex,setblastindex] = useState(-1);

    const mines = Array.from({ length: 25 }, (_, i) => i);

    const playSound = (sound) => {
        const audio = new Audio(sound);
        audio.play();
    };

    const resetGame = () => {
        setCellCheck(Array(25).fill(false));
        setGameOver(false);
        setGameStarted(false);
        setSuccessfulClicks(0);
        setProfitMultiplier(0);
        setCashedOut(false);
        setBetPlaced(false);
        setblastindex(-1);
        initializeMines(blastMineCount);
    };
    

    const handleBlastMineChange = (e) => {
        if (gameStarted && !gameOver) return;
        setBlastMineCount(parseInt(e.target.value, 10));
        resetGame();
       
    };

    const initializeMines = (blastCount) => {
        let allMines = new Set();
        while (allMines.size < TOTAL_MINES) {
            allMines.add(Math.floor(Math.random() * 25));
        }
        let allMinesArr = [...allMines];
        let blastMinesArr = new Set();
        while (blastMinesArr.size < blastCount) {
            let randIndex = Math.floor(Math.random() * TOTAL_MINES);
            blastMinesArr.add(allMinesArr[randIndex]);
        }
        setMinePositions(allMinesArr);
        setBlastMines([...blastMinesArr]);
    };

    useEffect(() => {
        initializeMines(blastMineCount);
    }, [blastMineCount]);

    const calculateMultiplier = (clicks) => {
        if(blastMineCount!==0){
            const multipliers = Array(25)
            .fill(1.01)
            .map((val, index) => parseFloat((val + index * 0.05).toFixed(2))); 
          
          const growthFactor = 1.02; 
          const maxMultiplier = 10; 
          const maxGrowth = 1000; 
          
          const reward = Math.min(
            multipliers[blastMineCount] * Math.pow(growthFactor, clicks),
            maxGrowth
          );
          
          return Math.min(reward, maxMultiplier);
          
        }   
    };
    
    const handleCellClick = (index) => {
        if (gameOver || cashedOut || cellCheck[index]) return;
    
        if (!gameStarted) setGameStarted(true);
    
        let newCheck = [...cellCheck];
        newCheck[index] = true;
        setCellCheck(newCheck);
    
        if (minePositions.includes(index) && blastMineCount>0) {
            if (blastMines.includes(index)) {
                setblastindex(index);
                playSound(blastSound);
                setGameOver(true);
                setCellCheck(Array(25).fill(true));
                setSuccessfulClicks(0);
                setProfitMultiplier(1.02);
                setBetPlaced(false);
            } else {
                playSound(clickSound);
                let newClicks = successfulClicks + 1;
                setSuccessfulClicks(newClicks);
                setProfitMultiplier(calculateMultiplier(newClicks));
            }
        } else {
            playSound(clickSound);
        }
    };
    const handleCashout = () => {
        if (gameOver || !gameStarted) return;
        setGameOver(true);
        setCashedOut(true);
        setCellCheck(Array(25).fill(true));
        let profitAmount =Number( betAmount) * profitMultiplier;
        setTotalamount((prev) => parseFloat(prev + profitAmount).toFixed(5));
        setBetPlaced(false);
    };

    const handleBetStarted = () => {
        if (betPlaced) {
          // alert("Game in progress! Finish or cash out first.");
            return;
        }
    
        if (Total_amount >=Number( betAmount) &&parseFloat(betAmount) >=0 && blastMineCount > 0) {
            if (gameOver || firstblastindex !== -1) {  
                resetGame();
                setblastindex(-1);
            }
            setTotalamount((prev) => prev -Number( betAmount));
            setBetPlaced(true);
            setGameStarted(true);
        } else {
           // alert('Insufficient funds, invalid bet amount, or no blast mines set!');
        }
    };
    

    const handleSetAmount = (e) => {
        let amount = e.target.value;
        if (amount === "") {
            setbetAmount("");
            return;
        }
        let numericAmount = Number(amount);

        if (!isNaN(numericAmount) && numericAmount <= Total_amount) {
            setbetAmount(numericAmount);
        } else {
            //alert("Bet amount cannot be more than total amount!");
        }
    };

    return (
        <div className="container">
            <div className="mine-settings">
                <label>Total Amount:</label>
                <input disabled className="amount" type="number" value={Total_amount} />

                <label>Bet Amount:</label>
                <input className="amount" type="number" value={betAmount} onChange={handleSetAmount} />

                <div className="profit-container">
                    <span className="profit">Multiplier: {profitMultiplier.toFixed(2)}x</span>
                    <button  type="submit" onClick={handleBetStarted} disabled={betPlaced}>Bet</button>
                </div>
            </div>

            <div className="mine-settings">
                <label>Blast Mines:</label>
                <select onChange={handleBlastMineChange} value={blastMineCount} disabled={gameStarted && !gameOver}>
                    {Array.from({ length: TOTAL_MINES  }, (_, i) => i).map((index) => (
                        <option key={index} value={index}>{index}</option>
                    ))}
                </select>
            </div>

            <div className="grid-container">
                {mines.map((index) => (
                    <div
                        className={`mine ${minePositions.includes(index) ? "mine-active" : ""}`}
                        key={index}
                        onClick={() => handleCellClick(index)}
                    >
                        {cellCheck[index]
                            ? minePositions.includes(index)
                                ? blastMines.includes(index)
                                    ? "💥"
                                : "💎"
                                : "✔️"
                            : ""}
                    </div>
                ))}
            </div>

            {gameStarted && !gameOver && !cashedOut && (
                <button className="cashout-btn" onClick={handleCashout}>
                    💰 Cashout
                </button>
            )}

            {(gameOver || cashedOut) && (
                <button className="reset-btn" onClick={resetGame}>
                    🔄 Restart Game
                </button>
            )}
        </div>
    );
};

export default Mine;
