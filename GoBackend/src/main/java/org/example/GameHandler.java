package org.example;

import jakarta.websocket.Session;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Queue;
import java.util.stream.Collectors;


public class GameHandler {
    static HashMap<String, Game> gameDict = new HashMap<>();
    static Queue<Player> playerQ = new LinkedList<>();

    static public void startGame(Player p1, Player p2) throws IOException {
        Game newGame = new Game(p1, p2);
        GameHandler.gameDict.put(p1.getSession().getId(), newGame);
        GameHandler.gameDict.put(p2.getSession().getId(), newGame);
        System.out.printf("Game with the id: %s has been added\n", p1.getSession().getId() + '-' + p2.getSession().getId());
        p1.getSession().getBasicRemote().sendText("gs pn: 1");
        p2.getSession().getBasicRemote().sendText("gs pn: 2");
        p1.setColour(Colour.BLACK);
        p2.setColour(Colour.WHITE);
        p1.setBoard(newGame.getBoard());
        p2.setBoard(newGame.getBoard());
        newGame.sendAllClients(String.format("bd: %d",Settings.getBoardDimensions()));
    }

    static public String makeMove(String msg, Session session) throws IOException {
        Game game = GameHandler.gameDict.get(session.getId());
        Player player = game.getTurn();
        if (player.getSession().getId().equals(session.getId()))  {
            String[] parseMsg = msg.split(" ");
            if (player.placePiece(game.getBoard(), Integer.parseInt(parseMsg[1]), Integer.parseInt(parseMsg[2]))) {
                game.toggleTurn();
                Board.printMatrix(game.getBoard().getBoardMatrix());
                game.sendAllClients(String.format("M: x: %d y: %d", Integer.parseInt(parseMsg[1]), Integer.parseInt(parseMsg[2])));
                game.setPassCount(0); // Set pass count to 0 cause move has been played
                return "Success";
            }
            return  "Invalid place";
        } else {
            return "not your turn";
        }
    }

    static public String piecesToBeDeleted(Session session) throws IOException {
        Game game = GameHandler.gameDict.get(session.getId());
        ArrayList<Piece> toBeDeleted = game.getBoard().deletePieces();
        if (!toBeDeleted.isEmpty()) {
            String s = toBeDeleted.stream().map(Piece::toString).collect(Collectors.joining(","));
            game.sendAllClients("D: " + s);
            return s;
        }

        return "";
    }

    static public String passMove(Session session) throws IOException {
        Game game = GameHandler.gameDict.get(session.getId());
        Player player = game.getTurn();
        if (player.getSession().getId().equals(session.getId()))  {
            game.toggleTurn();
            game.setPassCount(game.getPassCount() + 1);
            if (game.getPassCount() == 2) {
                game.sendAllClients(String.format("end: %d %d", game.getP1().getScore(), game.getP2().getScore()));
                return "End Game";
            }
            game.sendAllClients("pass");
            return "Success";
        }
        return "not your turn";
    }
}
