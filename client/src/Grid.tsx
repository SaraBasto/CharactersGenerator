import React, { useState, useEffect } from 'react';
import axios from 'axios';

import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Grid: React.FC = () => {
  const gridSize = 10;
  const [gridCharacters, setGridCharacters] = useState<string[][]>(
    Array(gridSize).fill(null).map(() => Array(gridSize).fill(''))
  );

  const [actualSecondDigits, setSecondDigits] = useState<string>('');
  const [matchedCharFirst, setMatchedCharFirst] = useState<string>('');
  const [matchedCharSecond, setMatchedCharSecond] = useState<string>('');
  const [charOccurrences, setCharOccurrences] = useState<Map<string, number>>(new Map());

  const [isRunning, setIsRunning] = useState<boolean>(false);

  const gridRef = React.useRef<string[][]>(gridCharacters);

  useEffect(() => {
    gridRef.current = gridCharacters;
  }, [gridCharacters]);

  const startGridUpdate = () => {
    setIsRunning(true);
    const interval = setInterval(async () => {
      try {
        await updateGridAndMatchCharacters();
      } catch (error) {
        console.error('Error updating grid or fetching code:', error);
      }
    }, 1000);

    return () => {
      setIsRunning(false);
      clearInterval(interval);
    };
  };

  const updateGridAndMatchCharacters = async () => {
    try {
      const updatedGrid = await Promise.all(
        Array.from({ length: gridSize }, (_, rowIndex) =>
          Promise.all(
            Array.from({ length: gridSize }, async (_, colIndex) => {
              const response = await axios.get<string>(`http://localhost:5000/randomCharacter`, {
                params: {
                  row: rowIndex,
                  col: colIndex,
                },
                responseType: 'text',
              });
              let objectResponse = JSON.parse(response.data);
              return objectResponse.character;
            })
          )
        )
      );

      setGridCharacters(updatedGrid);
      gridRef.current = updatedGrid;

      const response = await axios.get<string>('http://localhost:5000/getCurrentSeconds');
      const secondsString = String(response.data);
      setSecondDigits(secondsString);

      await updateMatchedCharacter(secondsString);
    } catch (error) {
      console.error('Error updating grid or fetching code:', error);
    }
  };

  const updateMatchedCharacter = async (secondDigits: string) => {
    console.log("Updating Matched Characters for Digits:", secondDigits);

    const digitsArray: number[] = secondDigits.split('').map(Number);
    let charAtFirstPosition = "";
    let charAtSecondPosition = "";

    if (digitsArray.length >= 2) {
      const firstPosition = digitsArray[0];
      const secondPosition = digitsArray[1];

      if (firstPosition >= 0 && firstPosition < gridSize) {
        charAtFirstPosition = gridRef.current[firstPosition][firstPosition];
        setMatchedCharFirst(charAtFirstPosition);
      } else {
        setMatchedCharFirst('');
      }

      if (secondPosition >= 0 && secondPosition < gridSize) {
        charAtSecondPosition = gridRef.current[secondPosition][secondPosition];
        setMatchedCharSecond(charAtSecondPosition);
      } else {
        setMatchedCharSecond('');
      }

      const occurrences = countCharacterOccurrences(gridRef.current, charAtFirstPosition, charAtSecondPosition);
      setCharOccurrences(occurrences);
    } else {
      setMatchedCharFirst('');
      setMatchedCharSecond('');
      setCharOccurrences(new Map());
    }
  };

  const countCharacterOccurrences = (grid: string[][], char1: string, char2: string) => {
    const occurrences = new Map<string, number>();
    let count1 = 0;
    let count2 = 0;

    grid.forEach(row => {
      row.forEach(cell => {
        if (cell === char1) count1++;
        if (cell === char2) count2++;
      });
    });

    if (char1) occurrences.set(char1, count1);
    if (char2) occurrences.set(char2, count2);

    return occurrences;
  };

  return (
    <div>
    <div className="container">
      <button className="btn charBtn">Character</button>
      <AccessTimeIcon ></AccessTimeIcon>
      <button className="btn gridBtn" onClick={startGridUpdate} disabled={isRunning}>GENERATE 2D GRID</button>
    </div>



      {gridCharacters.map((row, rowId) => (
        <div key={rowId} className="row">
          {row.map((char, colId) => (
            <div key={colId} className="grid">
              <p>{char}</p>
            </div>
          ))}
        </div>
      ))}

      <div>
        <div>
        <p className='btn code'>YOUR CODE:  {charOccurrences} {}</p>
        </div>
      </div>
    </div>
  );
};

export default Grid;