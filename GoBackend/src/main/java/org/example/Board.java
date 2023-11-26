package org.example;

import java.util.ArrayList;

public class Board {
    Piece[][] boardMatrix;

    public Board() {
        this.boardMatrix  = new Piece[Settings.getBoardDimensions()][Settings.getBoardDimensions()];
        for (int i = 0; i <  this.boardMatrix .length; i++) {
            for (int j = 0; j <  this.boardMatrix[i].length; j++) {
                this.boardMatrix[i][j] = new Piece(Colour.EMPTY, i, j);
            }
        }
    }

    public Piece[][] getBoardMatrix() {
        return boardMatrix;
    }

    public ArrayList<Piece> deletePieces() {
        ArrayList<Piece> piecesToBeDeleted = new ArrayList<>();
        for (int i = 0; i <  this.boardMatrix .length; i++) {
            for (int j = 0; j <  this.boardMatrix[i].length; j++) {
                if (this.boardMatrix[i][j].getColour() != Colour.EMPTY && Rules.checkCaptured(this, i, j))  {
                    piecesToBeDeleted.add(getBoardMatrix()[i][j]);
                }
            }
        }
        for (int i = 0; i < this.boardMatrix .length; i++) {
            for (int j = 0; j < this.boardMatrix [i].length; j++) {
                if (piecesToBeDeleted.contains(this.boardMatrix[i][j])) {
                    this.boardMatrix[i][j].setColour(Colour.EMPTY);
                }
            }
        }
        return piecesToBeDeleted;
    }

    public static void printMatrix(Piece[][] matrix) {
        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] != null) {
                    System.out.print(matrix[i][j].getColour() + " ");
                } else {
                    System.out.print(matrix[i][j] + " ");
                }
            }
            System.out.println(); // Move to the next line after printing a row
        }
        System.out.println();
    }
}
