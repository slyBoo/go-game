package org.example;

import jakarta.websocket.Session;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.Queue;

public class Rules {

    public static boolean registerMove(String s){
        return true;
    }

    public static boolean canPlace(Board board, int x, int y, Colour colour) {
        if (board.getBoardMatrix()[x][y].getColour() != Colour.EMPTY) {
            return false;
        }
        board.getBoardMatrix()[x][y].setColour(colour);
        // Suicide rule
        if (Rules.checkCaptured(board, x, y)) {
            board.getBoardMatrix()[x][y].setColour(Colour.EMPTY);
            return false;
        }
        return true;
    }

    public static boolean checkCaptured(Board board, int x, int y) {
        Piece piece = board.getBoardMatrix()[x][y];
        Queue<Piece> pieceQ = new LinkedList<>();
        ArrayList<Piece> visited = new ArrayList<>();
        visited.add(piece);
        for (Piece n:piece.getNeighbours(board)) {
            if (n.getColour() == Colour.EMPTY) {
                return false;
            }
            if (n.getColour() == piece.getColour()) {
                pieceQ.add(n);
            }
        }
        while (!pieceQ.isEmpty()) {
            Piece piece1 = pieceQ.poll();
            visited.add(piece1);
            for (Piece n:piece1.getNeighbours(board)) {
                if (visited.contains(n)) continue;
                if (n.getColour() == Colour.EMPTY) {
                    return false;
                }
                if (n.getColour() == piece1.getColour()) {
                    pieceQ.add(n);
                }
            }
        }
        return true;
    }
}
