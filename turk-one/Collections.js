/**
 * Created by sahand on 10/11/15.
 */

// A worker ticket maps a workerId to a sessionId and a decisionPointId
WorkerTickets = new Mongo.Collection("workerTickets")

DecisionPoints = new Mongo.Collection("decisionPoints");
Solutions = new Mongo.Collection("solutions");
ExitSurveys = new Mongo.Collection("exitSurveys");
QuitSurveys = new Mongo.Collection("quitSurveys");