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
        return "Invalid!";
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
        GameHandler.gameDict.remove(session.getId());
        System.out.println("WebSocket connection closed ");
    }

    public static void main(String[] args) {
        org.glassfish.tyrus.server.Server server = new org.glassfish.tyrus.server.Server("localhost", 80, "", null, Server.class);
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

