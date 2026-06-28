CREATE DATABASE  IF NOT EXISTS `advising_schedule_planner_db` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `advising_schedule_planner_db`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: advising_schedule_planner_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `advisor`
--

DROP TABLE IF EXISTS `advisor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `advisor` (
  `Advisor_ID` int NOT NULL AUTO_INCREMENT,
  `advisor_name` varchar(45) NOT NULL,
  `advisor_email` varchar(45) NOT NULL,
  `advisor_phone` varchar(45) DEFAULT NULL,
  `advisor_password` varchar(255) NOT NULL,
  PRIMARY KEY (`Advisor_ID`),
  UNIQUE KEY `advisor_email_UNIQUE` (`advisor_email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `advisor`
--

LOCK TABLES `advisor` WRITE;
/*!40000 ALTER TABLE `advisor` DISABLE KEYS */;
INSERT INTO `advisor` VALUES (1,'Ad','jedeg45024@divahd.com',NULL,'$2b$10$.5WOdieEe7ny2/wpDFOs/..yXNjoijapFcNrBLAhI0WKdf23hRkFm');
/*!40000 ALTER TABLE `advisor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `appointment_id` int NOT NULL AUTO_INCREMENT,
  `time_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `student_student_id` int NOT NULL,
  `priority_slot` int NOT NULL,
  `appointment_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `Advisor_Advisor_ID` int NOT NULL,
  `status` varchar(45) NOT NULL,
  PRIMARY KEY (`appointment_id`,`student_student_id`,`Advisor_Advisor_ID`),
  KEY `fk_Appointments_Student1_idx` (`student_student_id`),
  KEY `fk_Appointments_Advisor1_idx` (`Advisor_Advisor_ID`),
  CONSTRAINT `fk_Appointments_Advisor1` FOREIGN KEY (`Advisor_Advisor_ID`) REFERENCES `advisor` (`Advisor_ID`),
  CONSTRAINT `fk_Appointments_Student1` FOREIGN KEY (`student_student_id`) REFERENCES `student` (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (1,'2026-06-26 05:44:23',1,3,'2026-06-26 09:00:00','2026-06-26 09:30:00',1,'pending'),(2,'2026-06-26 07:58:42',5,3,'2026-06-26 09:30:00','2026-06-26 10:00:00',1,'cancelled'),(3,'2026-06-26 07:58:42',9,3,'2026-06-26 10:00:00','2026-06-26 10:30:00',1,'pending'),(4,'2026-06-26 07:58:42',13,3,'2026-06-26 10:30:00','2026-06-26 11:00:00',1,'pending'),(5,'2026-06-26 07:58:42',17,3,'2026-06-26 11:00:00','2026-06-26 11:30:00',1,'pending'),(6,'2026-06-26 07:58:42',21,3,'2026-06-26 11:30:00','2026-06-26 12:00:00',1,'pending'),(7,'2026-06-26 07:58:42',25,3,'2026-06-26 12:00:00','2026-06-26 12:30:00',1,'pending'),(8,'2026-06-26 07:58:42',29,3,'2026-06-26 12:30:00','2026-06-26 13:00:00',1,'pending'),(9,'2026-06-26 07:58:42',33,3,'2026-06-26 13:00:00','2026-06-26 13:30:00',1,'pending'),(10,'2026-06-26 07:58:42',37,3,'2026-06-26 13:30:00','2026-06-26 14:00:00',1,'pending'),(11,'2026-06-26 07:58:42',41,3,'2026-06-26 14:00:00','2026-06-26 14:30:00',1,'pending'),(12,'2026-06-26 07:58:42',45,3,'2026-06-26 14:30:00','2026-06-26 15:00:00',1,'pending'),(13,'2026-06-26 07:58:42',49,3,'2026-06-26 15:00:00','2026-06-26 15:30:00',1,'pending'),(14,'2026-06-26 07:58:42',4,3,'2026-06-26 15:30:00','2026-06-26 16:00:00',1,'pending'),(15,'2026-06-26 07:58:42',8,3,'2026-06-26 16:00:00','2026-06-26 16:30:00',1,'pending'),(16,'2026-06-26 07:58:42',12,3,'2026-06-26 16:30:00','2026-06-26 17:00:00',1,'pending'),(17,'2026-06-26 07:59:08',16,3,'2026-06-27 09:00:00','2026-06-27 09:30:00',1,'pending'),(18,'2026-06-26 07:59:08',20,3,'2026-06-27 09:30:00','2026-06-27 10:00:00',1,'pending'),(19,'2026-06-26 07:59:08',24,3,'2026-06-27 10:00:00','2026-06-27 10:30:00',1,'pending'),(20,'2026-06-26 07:59:08',28,3,'2026-06-27 10:30:00','2026-06-27 11:00:00',1,'pending'),(21,'2026-06-26 07:59:08',32,3,'2026-06-27 11:00:00','2026-06-27 11:30:00',1,'pending'),(22,'2026-06-26 07:59:08',36,3,'2026-06-27 11:30:00','2026-06-27 12:00:00',1,'pending'),(23,'2026-06-26 07:59:08',40,3,'2026-06-27 12:00:00','2026-06-27 12:30:00',1,'pending'),(24,'2026-06-26 07:59:08',44,3,'2026-06-27 12:30:00','2026-06-27 13:00:00',1,'pending'),(25,'2026-06-26 07:59:08',48,3,'2026-06-27 13:00:00','2026-06-27 13:30:00',1,'pending'),(26,'2026-06-26 07:59:08',3,3,'2026-06-27 13:30:00','2026-06-27 14:00:00',1,'pending'),(27,'2026-06-26 07:59:08',7,3,'2026-06-27 14:00:00','2026-06-27 14:30:00',1,'pending'),(28,'2026-06-26 07:59:08',11,3,'2026-06-27 14:30:00','2026-06-27 15:00:00',1,'pending'),(29,'2026-06-26 07:59:08',15,3,'2026-06-27 15:00:00','2026-06-27 15:30:00',1,'pending'),(30,'2026-06-26 07:59:08',19,3,'2026-06-27 15:30:00','2026-06-27 16:00:00',1,'pending'),(31,'2026-06-26 07:59:08',23,3,'2026-06-27 16:00:00','2026-06-27 16:30:00',1,'pending'),(32,'2026-06-26 07:59:08',27,3,'2026-06-27 16:30:00','2026-06-27 17:00:00',1,'pending');
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student` (
  `student_id` int NOT NULL AUTO_INCREMENT,
  `student_name` varchar(45) NOT NULL,
  `student_email` varchar(45) NOT NULL,
  `student_password` varchar(255) NOT NULL,
  `school_year` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `student_email_UNIQUE` (`student_email`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES (1,'St','yovoc17250@disiok.com','$2b$10$s/ELamcmRgl0t3U1Hxc06ObRCzDnReLmvzTF01n1e2yMmxXB2Jchi','senior'),(2,'Alex Smith','alex.smith0@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','freshman'),(3,'Jordan Johnson','jordan.johnson1@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','sophomore'),(4,'Taylor Lee','taylor.lee2@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','junior'),(5,'Morgan Garcia','morgan.garcia3@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','senior'),(6,'Casey Brown','casey.brown4@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','freshman'),(7,'Riley Martinez','riley.martinez5@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','sophomore'),(8,'Jamie Davis','jamie.davis6@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','junior'),(9,'Avery Lopez','avery.lopez7@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','senior'),(10,'Quinn Wilson','quinn.wilson8@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','freshman'),(11,'Sam Nguyen','sam.nguyen9@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','sophomore'),(12,'Drew Patel','drew.patel10@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','junior'),(13,'Cameron Kim','cameron.kim11@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','senior'),(14,'Skyler Chen','skyler.chen12@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','freshman'),(15,'Reese Khan','reese.khan13@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','sophomore'),(16,'Devin Reyes','devin.reyes14@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','junior'),(17,'Harper Cruz','harper.cruz15@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','senior'),(18,'Rowan Morales','rowan.morales16@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','freshman'),(19,'Emerson Ortiz','emerson.ortiz17@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','sophomore'),(20,'Finley Singh','finley.singh18@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','junior'),(21,'Sawyer Flores','sawyer.flores19@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','senior'),(22,'Kendall Smith','kendall.smith20@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','freshman'),(23,'Logan Johnson','logan.johnson21@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','sophomore'),(24,'Parker Lee','parker.lee22@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','junior'),(25,'Hayden Garcia','hayden.garcia23@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','senior'),(26,'Marlowe Brown','marlowe.brown24@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','freshman'),(27,'Alex Martinez','alex.martinez25@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','sophomore'),(28,'Jordan Davis','jordan.davis26@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','junior'),(29,'Taylor Lopez','taylor.lopez27@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','senior'),(30,'Morgan Wilson','morgan.wilson28@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','freshman'),(31,'Casey Nguyen','casey.nguyen29@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','sophomore'),(32,'Riley Patel','riley.patel30@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','junior'),(33,'Jamie Kim','jamie.kim31@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','senior'),(34,'Avery Chen','avery.chen32@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','freshman'),(35,'Quinn Khan','quinn.khan33@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','sophomore'),(36,'Sam Reyes','sam.reyes34@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','junior'),(37,'Drew Cruz','drew.cruz35@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','senior'),(38,'Cameron Morales','cameron.morales36@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','freshman'),(39,'Skyler Ortiz','skyler.ortiz37@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','sophomore'),(40,'Reese Singh','reese.singh38@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','junior'),(41,'Devin Flores','devin.flores39@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','senior'),(42,'Harper Smith','harper.smith40@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','freshman'),(43,'Rowan Johnson','rowan.johnson41@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','sophomore'),(44,'Emerson Lee','emerson.lee42@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','junior'),(45,'Finley Garcia','finley.garcia43@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','senior'),(46,'Sawyer Brown','sawyer.brown44@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','freshman'),(47,'Kendall Martinez','kendall.martinez45@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','sophomore'),(48,'Logan Davis','logan.davis46@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','junior'),(49,'Parker Lopez','parker.lopez47@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','senior'),(50,'Hayden Wilson','hayden.wilson48@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','freshman'),(51,'Marlowe Nguyen','marlowe.nguyen49@test.edu','$2b$10$01W5ntBYysdsatnIA8VqNuRJ/D285UTkd0WhtiF2rpKG7qeGBUBx.','sophomore');
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'advising_schedule_planner_db'
--

--
-- Dumping routines for database 'advising_schedule_planner_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-26  1:36:51
