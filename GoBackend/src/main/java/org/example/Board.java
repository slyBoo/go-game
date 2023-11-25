package org.example;

public class Board {
    Piece[][] boardMatrix;

    public Board() {
        this.boardMatrix  = new Piece[Settings.getBoardDimensions()][Settings.getBoardDimensions()];
    }

    public Piece[][] getBoardMatrix() {
        return boardMatrix;
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
    }
}
