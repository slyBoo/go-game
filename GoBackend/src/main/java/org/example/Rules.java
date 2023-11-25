package org.example;

import jakarta.websocket.Session;

public class Rules {

    public static boolean registerMove(String s){
        return true;
    }

    public static boolean canPlace(Board board, int x, int y) {
        if (board.getBoardMatrix()[x][y] == null) {
            return true;
        }
        return false;
    }
}
