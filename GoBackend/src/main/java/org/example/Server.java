package org.example;


import jakarta.websocket.OnClose;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.ServerEndpoint;

import java.io.IOException;


@ServerEndpoint("/game")
public class Server {
    @OnMessage
    public String onRec(String msg, Session session) throws IOException {
        if(msg.startsWith("M:")) {
            String s = GameHandler.makeMove(msg, session);
            GameHandler.piecesToBeDeleted(session);
            return s;
        }
        if(msg.equals("pass")) {
            return GameHandler.passMove(session);
        }
        return "Invalid";
    }

    @OnOpen
    public void helloOnOpen(Session session) throws IOException {
        System.out.println("WebSocket opened: " + session.getId());
        GameHandler.playerQ.add(new Player(session));
        if (GameHandler.playerQ.size() >= 2) {
            GameHandler.startGame(GameHandler.playerQ.poll(), GameHandler.playerQ.poll());
        }

    }

    @OnClose
    public void helloOnClose(Session session) {
        GameHandler.playerQ.removeIf(p -> session.getId().equals(p.getSession().getId()));
        System.out.println("WebSocket connection closed ");
    }

    public static void main(String[] args) {
        org.glassfish.tyrus.server.Server server = new org.glassfish.tyrus.server.Server("localhost", 80, "", null, Server.class);
//        Board board = new Board();
//        board.getBoardMatrix()[3][4] = new Piece(Colour.WHITE, 3, 4);
//        board.getBoardMatrix()[4][4] = new Piece(Colour.WHITE, 4, 4);
//        board.getBoardMatrix()[3][3] = new Piece(Colour.BLACK, 3, 3);
//        board.getBoardMatrix()[4][3] = new Piece(Colour.BLACK, 4, 3);
//        board.getBoardMatrix()[3][5] = new Piece(Colour.BLACK, 3, 5);
//        board.getBoardMatrix()[5][4] = new Piece(Colour.BLACK, 5, 4);
//        board.getBoardMatrix()[4][5] = new Piece(Colour.BLACK, 5, 4);
//        board.getBoardMatrix()[2][4] = new Piece(Colour.BLACK, 2, 4);
//        board.getBoardMatrix()[1][0] = new Piece(Colour.BLACK, 1, 0);
//        board.getBoardMatrix()[0][1] = new Piece(Colour.BLACK, 0, 1);
//        board.getBoardMatrix()[1][1] = new Piece(Colour.BLACK, 1, 1);
//        board.getBoardMatrix()[0][0] = new Piece(Colour.WHITE, 0, 0);
//
//
////        System.out.println(board.getBoardMatrix()[4][4].getNeighbours(board));
//        Board.printMatrix(board.getBoardMatrix());
//        board.deletePieces();
//        Board.printMatrix(board.getBoardMatrix());
//        board.getBoardMatrix()[3][4] = new Piece(Colour.WHITE, 3, 4);
//        board.getBoardMatrix()[3][4] = new Piece(Colour.WHITE, 4, 4);
//
//        board.deletePieces();
//        Board.printMatrix(board.getBoardMatrix());

        try {
            server.start();
            System.in.read();
        } catch (Exception e) {
            System.err.println(e.getMessage());
        } finally {
            server.stop();
        }
    }
}

