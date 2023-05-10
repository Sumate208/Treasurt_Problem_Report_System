CREATE DATABASE  IF NOT EXISTS `treasury` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `treasury`;
-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: localhost    Database: treasury
-- ------------------------------------------------------
-- Server version	8.0.32

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
-- Table structure for table `member`
--

DROP TABLE IF EXISTS `member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `member` (
  `user_id` int NOT NULL,
  `agency` varchar(50) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  `job_title` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  KEY `fk_member_users_idx` (`user_id`),
  CONSTRAINT `fk_member_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `member`
--

LOCK TABLES `member` WRITE;
/*!40000 ALTER TABLE `member` DISABLE KEYS */;
/*!40000 ALTER TABLE `member` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `problem_files`
--

DROP TABLE IF EXISTS `problem_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problem_files` (
  `problem_id` int NOT NULL,
  `file_name` varchar(50) DEFAULT NULL,
  `path` varchar(100) DEFAULT NULL,
  `part` enum('0','1') NOT NULL,
  PRIMARY KEY (`problem_id`),
  CONSTRAINT `fk_problemFiles_problems` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`problem_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `problem_files`
--

LOCK TABLES `problem_files` WRITE;
/*!40000 ALTER TABLE `problem_files` DISABLE KEYS */;
/*!40000 ALTER TABLE `problem_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `problem_log`
--

DROP TABLE IF EXISTS `problem_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problem_log` (
  `problem_id` int NOT NULL,
  `discription` varchar(150) DEFAULT NULL,
  `log_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`problem_id`),
  CONSTRAINT `fk_problemsLog_problems` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`problem_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `problem_log`
--

LOCK TABLES `problem_log` WRITE;
/*!40000 ALTER TABLE `problem_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `problem_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `problem_permision`
--

DROP TABLE IF EXISTS `problem_permision`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problem_permision` (
  `user_id` int NOT NULL,
  `problem_id` int NOT NULL,
  KEY `fk_permision_problems_idx` (`problem_id`),
  KEY `fk_permision_users_idx` (`user_id`),
  CONSTRAINT `fk_permision_problems` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`problem_id`),
  CONSTRAINT `fk_permision_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `problem_permision`
--

LOCK TABLES `problem_permision` WRITE;
/*!40000 ALTER TABLE `problem_permision` DISABLE KEYS */;
/*!40000 ALTER TABLE `problem_permision` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `problems`
--

DROP TABLE IF EXISTS `problems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problems` (
  `problem_id` int NOT NULL AUTO_INCREMENT,
  `informer_id` int NOT NULL,
  `system_name` varchar(50) NOT NULL,
  `write_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `details` varchar(1000) NOT NULL,
  `editor_id` int NOT NULL,
  `analysis` varchar(1000) DEFAULT NULL,
  `state` varchar(1) NOT NULL,
  `status` varchar(100) NOT NULL,
  `assign_details` varchar(1000) DEFAULT NULL,
  `problem_type` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`problem_id`),
  KEY `fk_problems_users_1_idx` (`informer_id`),
  KEY `fk_problems_users_edt_idx` (`editor_id`),
  CONSTRAINT `fk_problems_users_edt` FOREIGN KEY (`editor_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_problems_users_ifm` FOREIGN KEY (`informer_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `problems`
--

LOCK TABLES `problems` WRITE;
/*!40000 ALTER TABLE `problems` DISABLE KEYS */;
/*!40000 ALTER TABLE `problems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `user_id` int NOT NULL,
  `team` varchar(50) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_staff_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (1,'ศูนย์เทคโนโลยีสารสนเทศ','ผศ.'),(2,'ยุทธศาสตร์และติดตามประเมินผล','ผอ.'),(3,'ยุทธศาสตร์และติดตามประเมินผล','พนง.'),(4,'ยุทธศาสตร์และติดตามประเมินผล','พนง.'),(5,'ยุทธศาสตร์และติดตามประเมินผล','พนง.'),(6,'พัฒนาระบบสารสนเทศ','ผอ.'),(7,'พัฒนาระบบสารสนเทศ','พนง.'),(8,'พัฒนาระบบสารสนเทศ','พนง.'),(9,'พัฒนาระบบสารสนเทศ','พนง.'),(10,'ระบบคอมพิวเตอร์และเครือข่าย','ผอ.'),(11,'ระบบคอมพิวเตอร์และเครือข่าย','พนง.'),(12,'ระบบคอมพิวเตอร์และเครือข่าย','พนง.'),(13,'ระบบคอมพิวเตอร์และเครือข่าย','พนง.'),(14,'วิเคราะห์และประมวลผลข้อมูล','ผอ.'),(15,'วิเคราะห์และประมวลผลข้อมูล','พนง.'),(16,'วิเคราะห์และประมวลผลข้อมูล','พนง.'),(17,'วิเคราะห์และประมวลผลข้อมูล','พนง.');
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `test`
--

DROP TABLE IF EXISTS `test`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `test` (
  `id` int NOT NULL AUTO_INCREMENT,
  `text` varchar(45) NOT NULL,
  `write_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `test`
--

LOCK TABLES `test` WRITE;
/*!40000 ALTER TABLE `test` DISABLE KEYS */;
INSERT INTO `test` VALUES (1,'ทอสอบ','2023-05-07 20:22:22'),(2,'ทอสอบ1','2023-05-07 20:48:23'),(3,'ทอสอบ2','2023-05-07 20:48:23');
/*!40000 ALTER TABLE `test` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tokens`
--

DROP TABLE IF EXISTS `tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokens` (
  `user_id` int NOT NULL,
  `token` varchar(100) DEFAULT NULL,
  `user_type` enum('staff','member') DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_tokens_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tokens`
--

LOCK TABLES `tokens` WRITE;
/*!40000 ALTER TABLE `tokens` DISABLE KEYS */;
INSERT INTO `tokens` VALUES (3,'v6FtyZcNGyj9FU2n-qmgXo^g@@nRGCT9M54JGLJ8fHhFenzD$ZCGIdV@vhR3Tp2@wOCrTwM^q0Baag*5FcpPnvOk@=Z0aKbnLU0W','staff');
/*!40000 ALTER TABLE `tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(20) NOT NULL,
  `last_name` varchar(20) NOT NULL,
  `username` varchar(13) NOT NULL,
  `phone` varchar(10) NOT NULL,
  `password` varchar(200) NOT NULL,
  `user_type` enum('member','staff') NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'ผอ.','ศูนย์IT','0000000000','0800000000','$2b$05$5/sLU15OasfS6FHqv7JJYeo3gWzVJVbH0ozgj9DBmpdcq7DPMc4sy','staff'),(2,'ผอ.ส่วน1','ยุทธศาสตร์','1111111111110','0811111110','$2b$05$BPHsqhQuTR925MRfkoqOnONBtHFVHj4cn6BogqzJ/tYJcSWfQ3K/C','staff'),(3,'พนง.1','ยุทธศาสตร์','1111111111111','0811111111','$2b$05$29fnEMTKDOCzxSepHUnCv.lF2PLBieiWg5OiR8cLfGAo94UdIOZWe','staff'),(4,'พนง.2','ยุทธศาสตร์','1111111111112','0811111112','$2b$05$1he2d860mr2J.02XFkvr4.loYrcTgqb7wIzbfC1jLq2rALNX7HV2m','staff'),(5,'พนง.3','ยุทธศาสตร์','1111111111113','0811111113','$2b$05$w4VH9j52NWLsHj8e8FLshuMD38mHT1bYeBKhWcG5rkEP.6.4IsnsC','staff'),(6,'ผอ.ส่วน2','พัฒนาระบบ','2222222222220','0822222220','$2b$05$lqXwko2Z3XXkfoDbhuhcNOOBqq6LCCcEh/8KuQS0Pf3951v2PQurC','staff'),(7,'พนง.1','พัฒนาระบบ','2222222222221','0822222221','$2b$05$1wGoFHnuiYYbL8R3lTvGa.e5qyJySWiaagrNCkzqPaUEWqR5Cry3q','staff'),(8,'พนง.2','พัฒนาระบบ','2222222222222','0822222222','$2b$05$8UzSnj.MdxbMZaO9.32ExeMXLcM3ON7LT1j8FjP2QdTtOvc.YLumu','staff'),(9,'พนง.3','พัฒนาระบบ','2222222222223','0822222223','$2b$05$mt/0Rw7VUiH8mR8fRdDQcOeVSty89Yw.wbTp31pu9OvmpPW1cbAZu','staff'),(10,'ผอ.ส่วน3','เครือข่าย','3333333333330','0833333330','$2b$05$GJ.9wwJQ/arl.jBi3H5VWuiciI5pYo55xeWsgmjBVKpfqGtAa6mna','staff'),(11,'พนง.1','เครือข่าย','3333333333331','0833333331','$2b$05$Mya8cONQuFjo5PPT6LJlSesO4z8EV36O0OAXytuPepUNB6tZT5bFq','staff'),(12,'พนง.2','เครือข่าย','3333333333332','0833333332','$2b$05$6mDcBSSi87WfeFt2uodpM.0/KU.1leWwwEUXpmQkS/ndLt6/maNM.','staff'),(13,'พนง.3','เครือข่าย','3333333333333','0833333333','$2b$05$cwNhBut7w1vRoT1Shj1IX.VdQK8FdJRqjqAEzzM8/1N13V.a8t9Oe','staff'),(14,'ผอ.ส่วน4','ประมวลผลข้อมูล','4444444444440','0844444440','$2b$05$37YdNnGy2ZJhiEZeJolgZeDkGOh21a0hDHk2sJSJx/gncQN.VHWMq','staff'),(15,'พนง.1','ประมวลผลข้อมูล','4444444444441','0844444441','$2b$05$oNv2bsVKDSToUopCogR8Q.kz3rbXfl2o6yzXUwIYUZtZZitRaZeYa','staff'),(16,'พนง.2','ประมวลผลข้อมูล','4444444444442','0844444442','$2b$05$HGF.X3ZFKhmMkritHjdM4eebNXxBy8utk5GH4KxZUSrWPkmjmiYtG','staff'),(17,'พนง.3','ประมวลผลข้อมูล','4444444444443','0844444443','$2b$05$IWhCLYaTZvzfMvfYge/a2uuaS5.zi08x9rScKqcaGyVDf1GK.Sy8K','staff');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-05-11  2:00:51
