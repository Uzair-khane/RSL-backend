-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 15, 2024 at 12:24 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `taxiapp_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` enum('add','view','update','delete','login') NOT NULL,
  `ip_address` varchar(15) DEFAULT '127.0.0.1',
  `detail` text DEFAULT NULL,
  `status` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `ip_address`, `detail`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-13 06:28:03', '2024-11-13 06:28:03'),
(2, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-13 06:29:23', '2024-11-13 06:29:23'),
(3, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-13 06:32:27', '2024-11-13 06:32:27'),
(4, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-13 06:34:33', '2024-11-13 06:34:33'),
(5, 1, 'login', '::ffff:127.0.0.', 'Imran Azim is logged in.', 1, '2024-11-13 06:40:39', '2024-11-13 06:40:39'),
(6, 1, 'update', '::1', 'ID = 10 record status has been changed to 0 from menus.', 1, '2024-11-13 06:40:47', '2024-11-13 06:40:47'),
(7, 1, 'update', '::1', 'ID = 10 record status has been changed to 1 from menus.', 1, '2024-11-13 06:40:54', '2024-11-13 06:40:54'),
(8, 1, 'update', '::1', 'ID = 14 record status has been changed to 0 from menus.', 1, '2024-11-13 06:41:15', '2024-11-13 06:41:15'),
(9, 1, 'update', '::1', 'ID = 13 record status has been changed to 0 from menus.', 1, '2024-11-13 06:41:16', '2024-11-13 06:41:16'),
(10, 1, 'update', '::1', 'ID = 12 record status has been changed to 0 from menus.', 1, '2024-11-13 06:41:17', '2024-11-13 06:41:17'),
(11, 1, 'update', '::1', 'ID = 11 record status has been changed to 0 from menus.', 1, '2024-11-13 06:41:19', '2024-11-13 06:41:19'),
(12, 1, 'delete', '::1', 'ID = 47 record has been deleted from menus.', 1, '2024-11-13 06:41:23', '2024-11-13 06:41:23'),
(13, 1, 'delete', '::1', 'ID = 45 record has been deleted from menus.', 1, '2024-11-13 06:41:30', '2024-11-13 06:41:30'),
(14, 1, 'delete', '::1', 'ID = 44 record has been deleted from menus.', 1, '2024-11-13 06:41:33', '2024-11-13 06:41:33'),
(15, 1, 'delete', '::1', 'ID = 43 record has been deleted from menus.', 1, '2024-11-13 06:41:36', '2024-11-13 06:41:36'),
(16, 1, 'delete', '::1', 'ID = 46 record has been deleted from menus.', 1, '2024-11-13 06:41:39', '2024-11-13 06:41:39'),
(17, 1, 'delete', '::1', 'ID = 41 record has been deleted from menus.', 1, '2024-11-13 06:41:42', '2024-11-13 06:41:42'),
(18, 1, 'delete', '::1', 'ID = 40 record has been deleted from menus.', 1, '2024-11-13 06:41:45', '2024-11-13 06:41:45'),
(19, 1, 'delete', '::1', 'ID = 42 record has been deleted from menus.', 1, '2024-11-13 06:41:48', '2024-11-13 06:41:48'),
(20, 1, 'delete', '::1', 'ID = 14 record has been deleted from menus.', 1, '2024-11-13 06:41:50', '2024-11-13 06:41:50'),
(21, 1, 'delete', '::1', 'ID = 13 record has been deleted from menus.', 1, '2024-11-13 06:41:53', '2024-11-13 06:41:53'),
(22, 1, 'delete', '::1', 'ID = 12 record has been deleted from menus.', 1, '2024-11-13 06:41:56', '2024-11-13 06:41:56'),
(23, 1, 'delete', '::1', 'ID = 11 record has been deleted from menus.', 1, '2024-11-13 06:41:59', '2024-11-13 06:41:59'),
(24, 1, 'delete', '::1', 'ID = 10 record has been deleted from menus.', 1, '2024-11-13 06:42:12', '2024-11-13 06:42:12'),
(25, 1, 'delete', '::1', 'ID = 95 record has been deleted from menus.', 1, '2024-11-13 06:42:25', '2024-11-13 06:42:25'),
(26, 1, 'delete', '::1', 'ID = 77 record has been deleted from menus.', 1, '2024-11-13 06:42:29', '2024-11-13 06:42:29'),
(27, 1, 'delete', '::1', 'ID = 63 record has been deleted from menus.', 1, '2024-11-13 06:42:32', '2024-11-13 06:42:32'),
(28, 1, 'delete', '::1', 'ID = 62 record has been deleted from menus.', 1, '2024-11-13 06:42:35', '2024-11-13 06:42:35'),
(29, 1, 'update', '::1', 'ID = 15 record status has been changed to 0 from menus.', 1, '2024-11-13 06:42:55', '2024-11-13 06:42:55'),
(30, 1, 'delete', '::1', 'ID = 15 record has been deleted from menus.', 1, '2024-11-13 06:42:58', '2024-11-13 06:42:58'),
(31, 1, 'delete', '::1', 'ID = 64 record has been deleted from menus.', 1, '2024-11-13 06:43:07', '2024-11-13 06:43:07'),
(32, 1, 'delete', '::1', 'ID = 65 record has been deleted from menus.', 1, '2024-11-13 06:43:09', '2024-11-13 06:43:09'),
(33, 1, 'delete', '::1', 'ID = 76 record has been deleted from menus.', 1, '2024-11-13 06:43:12', '2024-11-13 06:43:12'),
(34, 1, 'delete', '::1', 'ID = 80 record has been deleted from menus.', 1, '2024-11-13 06:43:15', '2024-11-13 06:43:15'),
(35, 1, 'delete', '::1', 'ID = 159 record has been deleted from menus.', 1, '2024-11-13 06:43:18', '2024-11-13 06:43:18'),
(36, 1, 'delete', '::1', 'ID = 16 record has been deleted from menus.', 1, '2024-11-13 06:43:31', '2024-11-13 06:43:31'),
(37, 1, 'delete', '::1', 'ID = 66 record has been deleted from menus.', 1, '2024-11-13 06:44:02', '2024-11-13 06:44:02'),
(38, 1, 'delete', '::1', 'ID = 67 record has been deleted from menus.', 1, '2024-11-13 06:44:05', '2024-11-13 06:44:05'),
(39, 1, 'delete', '::1', 'ID = 78 record has been deleted from menus.', 1, '2024-11-13 06:44:07', '2024-11-13 06:44:07'),
(40, 1, 'delete', '::1', 'ID = 91 record has been deleted from menus.', 1, '2024-11-13 06:44:09', '2024-11-13 06:44:09'),
(41, 1, 'delete', '::1', 'ID = 154 record has been deleted from menus.', 1, '2024-11-13 06:44:12', '2024-11-13 06:44:12'),
(42, 1, 'delete', '::1', 'ID = 17 record has been deleted from menus.', 1, '2024-11-13 06:44:32', '2024-11-13 06:44:32'),
(43, 1, 'delete', '::1', 'ID = 68 record has been deleted from menus.', 1, '2024-11-13 06:44:41', '2024-11-13 06:44:41'),
(44, 1, 'delete', '::1', 'ID = 69 record has been deleted from menus.', 1, '2024-11-13 06:44:44', '2024-11-13 06:44:44'),
(45, 1, 'delete', '::1', 'ID = 79 record has been deleted from menus.', 1, '2024-11-13 06:44:46', '2024-11-13 06:44:46'),
(46, 1, 'delete', '::1', 'ID = 93 record has been deleted from menus.', 1, '2024-11-13 06:44:49', '2024-11-13 06:44:49'),
(47, 1, 'delete', '::1', 'ID = 18 record has been deleted from menus.', 1, '2024-11-13 06:45:00', '2024-11-13 06:45:00'),
(48, 1, 'delete', '::1', 'ID = 70 record has been deleted from menus.', 1, '2024-11-13 06:45:09', '2024-11-13 06:45:09'),
(49, 1, 'delete', '::1', 'ID = 71 record has been deleted from menus.', 1, '2024-11-13 06:45:12', '2024-11-13 06:45:12'),
(50, 1, 'delete', '::1', 'ID = 123 record has been deleted from menus.', 1, '2024-11-13 06:45:15', '2024-11-13 06:45:15'),
(51, 1, 'delete', '::1', 'ID = 19 record has been deleted from menus.', 1, '2024-11-13 06:45:27', '2024-11-13 06:45:27'),
(52, 1, 'delete', '::1', 'ID = 72 record has been deleted from menus.', 1, '2024-11-13 06:45:35', '2024-11-13 06:45:35'),
(53, 1, 'delete', '::1', 'ID = 73 record has been deleted from menus.', 1, '2024-11-13 06:45:39', '2024-11-13 06:45:39'),
(54, 1, 'delete', '::1', 'ID = 86 record has been deleted from menus.', 1, '2024-11-13 06:45:42', '2024-11-13 06:45:42'),
(55, 1, 'delete', '::1', 'ID = 87 record has been deleted from menus.', 1, '2024-11-13 06:45:45', '2024-11-13 06:45:45'),
(56, 1, 'delete', '::1', 'ID = 88 record has been deleted from menus.', 1, '2024-11-13 06:45:47', '2024-11-13 06:45:47'),
(57, 1, 'delete', '::1', 'ID = 89 record has been deleted from menus.', 1, '2024-11-13 06:45:50', '2024-11-13 06:45:50'),
(58, 1, 'delete', '::1', 'ID = 20 record has been deleted from menus.', 1, '2024-11-13 06:45:59', '2024-11-13 06:45:59'),
(59, 1, 'delete', '::1', 'ID = 74 record has been deleted from menus.', 1, '2024-11-13 06:46:07', '2024-11-13 06:46:07'),
(60, 1, 'delete', '::1', 'ID = 75 record has been deleted from menus.', 1, '2024-11-13 06:46:10', '2024-11-13 06:46:10'),
(61, 1, 'delete', '::1', 'ID = 85 record has been deleted from menus.', 1, '2024-11-13 06:46:12', '2024-11-13 06:46:12'),
(62, 1, 'delete', '::1', 'ID = 162 record has been deleted from menus.', 1, '2024-11-13 06:46:15', '2024-11-13 06:46:15'),
(63, 1, 'delete', '::1', 'ID = 21 record has been deleted from menus.', 1, '2024-11-13 06:46:28', '2024-11-13 06:46:28'),
(64, 1, 'delete', '::1', 'ID = 165 record has been deleted from menus.', 1, '2024-11-13 06:46:39', '2024-11-13 06:46:39'),
(65, 1, 'delete', '::1', 'ID = 23 record has been deleted from menus.', 1, '2024-11-13 06:46:45', '2024-11-13 06:46:45'),
(66, 1, 'delete', '::1', 'ID = 24 record has been deleted from menus.', 1, '2024-11-13 06:46:47', '2024-11-13 06:46:47'),
(67, 1, 'delete', '::1', 'ID = 113 record has been deleted from menus.', 1, '2024-11-13 06:46:50', '2024-11-13 06:46:50'),
(68, 1, 'delete', '::1', 'ID = 114 record has been deleted from menus.', 1, '2024-11-13 06:46:53', '2024-11-13 06:46:53'),
(69, 1, 'delete', '::1', 'ID = 115 record has been deleted from menus.', 1, '2024-11-13 06:46:56', '2024-11-13 06:46:56'),
(70, 1, 'delete', '::1', 'ID = 145 record has been deleted from menus.', 1, '2024-11-13 06:46:59', '2024-11-13 06:46:59'),
(71, 1, 'delete', '::1', 'ID = 146 record has been deleted from menus.', 1, '2024-11-13 06:47:02', '2024-11-13 06:47:02'),
(72, 1, 'delete', '::1', 'ID = 147 record has been deleted from menus.', 1, '2024-11-13 06:47:04', '2024-11-13 06:47:04'),
(73, 1, 'delete', '::1', 'ID = 148 record has been deleted from menus.', 1, '2024-11-13 06:47:07', '2024-11-13 06:47:07'),
(74, 1, 'delete', '::1', 'ID = 149 record has been deleted from menus.', 1, '2024-11-13 06:47:09', '2024-11-13 06:47:09'),
(75, 1, 'delete', '::1', 'ID = 150 record has been deleted from menus.', 1, '2024-11-13 06:47:13', '2024-11-13 06:47:13'),
(76, 1, 'delete', '::1', 'ID = 164 record has been deleted from menus.', 1, '2024-11-13 06:47:15', '2024-11-13 06:47:15'),
(77, 1, 'delete', '::1', 'ID = 22 record has been deleted from menus.', 1, '2024-11-13 06:47:40', '2024-11-13 06:47:40'),
(78, 1, 'delete', '::1', 'ID = 140 record has been deleted from menus.', 1, '2024-11-13 06:48:21', '2024-11-13 06:48:21'),
(79, 1, 'delete', '::1', 'ID = 141 record has been deleted from menus.', 1, '2024-11-13 06:48:24', '2024-11-13 06:48:24'),
(80, 1, 'delete', '::1', 'ID = 142 record has been deleted from menus.', 1, '2024-11-13 06:48:29', '2024-11-13 06:48:29'),
(81, 1, 'delete', '::1', 'ID = 151 record has been deleted from menus.', 1, '2024-11-13 06:48:32', '2024-11-13 06:48:32'),
(82, 1, 'delete', '::1', 'ID = 152 record has been deleted from menus.', 1, '2024-11-13 06:48:36', '2024-11-13 06:48:36'),
(83, 1, 'delete', '::1', 'ID = 153 record has been deleted from menus.', 1, '2024-11-13 06:48:40', '2024-11-13 06:48:40'),
(84, 1, 'delete', '::1', 'ID = 166 record has been deleted from menus.', 1, '2024-11-13 06:48:44', '2024-11-13 06:48:44'),
(85, 1, 'delete', '::1', 'ID = 167 record has been deleted from menus.', 1, '2024-11-13 06:48:47', '2024-11-13 06:48:47'),
(86, 1, 'delete', '::1', 'ID = 168 record has been deleted from menus.', 1, '2024-11-13 06:48:50', '2024-11-13 06:48:50'),
(87, 1, 'delete', '::1', 'ID = 169 record has been deleted from menus.', 1, '2024-11-13 06:48:53', '2024-11-13 06:48:53'),
(88, 1, 'delete', '::1', 'ID = 92 record has been deleted from menus.', 1, '2024-11-13 06:49:08', '2024-11-13 06:49:08'),
(89, 1, 'delete', '::1', 'ID = 27 record has been deleted from menus.', 1, '2024-11-13 06:49:17', '2024-11-13 06:49:17'),
(90, 1, 'delete', '::1', 'ID = 143 record has been deleted from menus.', 1, '2024-11-13 06:49:40', '2024-11-13 06:49:40'),
(91, 1, 'delete', '::1', 'ID = 103 record has been deleted from menus.', 1, '2024-11-13 06:49:45', '2024-11-13 06:49:45'),
(92, 1, 'delete', '::1', 'ID = 82 record has been deleted from menus.', 1, '2024-11-13 06:51:02', '2024-11-13 06:51:02'),
(93, 1, 'delete', '::1', 'ID = 83 record has been deleted from menus.', 1, '2024-11-13 06:51:05', '2024-11-13 06:51:05'),
(94, 1, 'delete', '::1', 'ID = 84 record has been deleted from menus.', 1, '2024-11-13 06:51:08', '2024-11-13 06:51:08'),
(95, 1, 'delete', '::1', 'ID = 81 record has been deleted from menus.', 1, '2024-11-13 06:51:19', '2024-11-13 06:51:19'),
(96, 1, 'delete', '::1', 'ID = 98 record has been deleted from menus.', 1, '2024-11-13 06:51:28', '2024-11-13 06:51:28'),
(97, 1, 'delete', '::1', 'ID = 99 record has been deleted from menus.', 1, '2024-11-13 06:51:30', '2024-11-13 06:51:30'),
(98, 1, 'delete', '::1', 'ID = 100 record has been deleted from menus.', 1, '2024-11-13 06:51:33', '2024-11-13 06:51:33'),
(99, 1, 'delete', '::1', 'ID = 101 record has been deleted from menus.', 1, '2024-11-13 06:51:36', '2024-11-13 06:51:36'),
(100, 1, 'delete', '::1', 'ID = 102 record has been deleted from menus.', 1, '2024-11-13 06:51:39', '2024-11-13 06:51:39'),
(101, 1, 'delete', '::1', 'ID = 97 record has been deleted from menus.', 1, '2024-11-13 06:51:49', '2024-11-13 06:51:49'),
(102, 1, 'delete', '::1', 'ID = 106 record has been deleted from menus.', 1, '2024-11-13 06:51:57', '2024-11-13 06:51:57'),
(103, 1, 'delete', '::1', 'ID = 105 record has been deleted from menus.', 1, '2024-11-13 06:52:00', '2024-11-13 06:52:00'),
(104, 1, 'delete', '::1', 'ID = 104 record has been deleted from menus.', 1, '2024-11-13 06:52:09', '2024-11-13 06:52:09'),
(105, 1, 'delete', '::1', 'ID = 119 record has been deleted from menus.', 1, '2024-11-13 06:52:18', '2024-11-13 06:52:18'),
(106, 1, 'delete', '::1', 'ID = 118 record has been deleted from menus.', 1, '2024-11-13 06:52:21', '2024-11-13 06:52:21'),
(107, 1, 'delete', '::1', 'ID = 116 record has been deleted from menus.', 1, '2024-11-13 06:52:31', '2024-11-13 06:52:31'),
(108, 1, 'delete', '::1', 'ID = 121 record has been deleted from menus.', 1, '2024-11-13 06:52:43', '2024-11-13 06:52:43'),
(109, 1, 'delete', '::1', 'ID = 120 record has been deleted from menus.', 1, '2024-11-13 06:52:46', '2024-11-13 06:52:46'),
(110, 1, 'delete', '::1', 'ID = 117 record has been deleted from menus.', 1, '2024-11-13 06:52:58', '2024-11-13 06:52:58'),
(111, 1, 'delete', '::1', 'ID = 155 record has been deleted from menus.', 1, '2024-11-13 06:53:59', '2024-11-13 06:53:59'),
(112, 1, 'delete', '::1', 'ID = 156 record has been deleted from menus.', 1, '2024-11-13 06:54:02', '2024-11-13 06:54:02'),
(113, 1, 'delete', '::1', 'ID = 157 record has been deleted from menus.', 1, '2024-11-13 06:54:12', '2024-11-13 06:54:12'),
(114, 1, 'delete', '::1', 'ID = 158 record has been deleted from menus.', 1, '2024-11-13 06:54:15', '2024-11-13 06:54:15'),
(115, 1, 'delete', '::1', 'ID = 125 record has been deleted from menus.', 1, '2024-11-13 06:54:19', '2024-11-13 06:54:19'),
(116, 1, 'delete', '::1', 'ID = 126 record has been deleted from menus.', 1, '2024-11-13 06:54:22', '2024-11-13 06:54:22'),
(117, 1, 'delete', '::1', 'ID = 127 record has been deleted from menus.', 1, '2024-11-13 06:54:25', '2024-11-13 06:54:25'),
(118, 1, 'update', '::1', 'Downloads Menu has been added.', 1, '2024-11-13 06:55:17', '2024-11-13 06:55:17'),
(119, 1, 'delete', '::1', 'ID = 132 record has been deleted from menus.', 1, '2024-11-13 06:55:36', '2024-11-13 06:55:36'),
(120, 1, 'delete', '::1', 'ID = 133 record has been deleted from menus.', 1, '2024-11-13 06:55:39', '2024-11-13 06:55:39'),
(121, 1, 'delete', '::1', 'ID = 131 record has been deleted from menus.', 1, '2024-11-13 06:55:56', '2024-11-13 06:55:56'),
(122, 1, 'delete', '::1', 'ID = 135 record has been deleted from menus.', 1, '2024-11-13 06:56:04', '2024-11-13 06:56:04'),
(123, 1, 'delete', '::1', 'ID = 136 record has been deleted from menus.', 1, '2024-11-13 06:56:08', '2024-11-13 06:56:08'),
(124, 1, 'delete', '::1', 'ID = 137 record has been deleted from menus.', 1, '2024-11-13 06:56:11', '2024-11-13 06:56:11'),
(125, 1, 'delete', '::1', 'ID = 138 record has been deleted from menus.', 1, '2024-11-13 06:56:14', '2024-11-13 06:56:14'),
(126, 1, 'delete', '::1', 'ID = 144 record has been deleted from menus.', 1, '2024-11-13 06:56:16', '2024-11-13 06:56:16'),
(127, 1, 'delete', '::1', 'ID = 134 record has been deleted from menus.', 1, '2024-11-13 06:56:44', '2024-11-13 06:56:44'),
(128, 1, 'delete', '::1', 'ID = 163 record has been deleted from menus.', 1, '2024-11-13 06:56:52', '2024-11-13 06:56:52'),
(129, 1, 'delete', '::1', 'ID = 160 record has been deleted from menus.', 1, '2024-11-13 06:56:58', '2024-11-13 06:56:58'),
(130, 1, 'delete', '::1', 'ID = 7 record has been deleted from menus.', 1, '2024-11-13 06:57:21', '2024-11-13 06:57:21'),
(131, 1, 'update', '::1', 'Menu ID = 2 submenu Pages has been updated.', 1, '2024-11-13 06:57:34', '2024-11-13 06:57:34'),
(132, 1, 'update', '::1', 'Menu ID = 2 submenu Activity Logs has been updated.', 1, '2024-11-13 06:57:41', '2024-11-13 06:57:41'),
(133, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-13 06:59:31', '2024-11-13 06:59:31'),
(134, 1, 'update', '::1', 'Menu ID = 124 submenu Documents has been updated.', 1, '2024-11-13 07:00:15', '2024-11-13 07:00:15'),
(135, 1, 'update', '::1', 'Menu ID = 124 submenu Documents Add has been updated.', 1, '2024-11-13 07:00:29', '2024-11-13 07:00:29'),
(136, 1, 'update', '::1', 'Menu ID = 124 submenu Documents Update has been updated.', 1, '2024-11-13 07:00:43', '2024-11-13 07:00:43'),
(137, 1, 'update', '::1', 'Menu ID = 124 submenu Documents has been updated.', 1, '2024-11-13 07:00:53', '2024-11-13 07:00:53'),
(138, 1, 'update', '::1', 'Menu ID = 124 submenu Documents Add has been updated.', 1, '2024-11-13 07:01:01', '2024-11-13 07:01:01'),
(139, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-13 07:04:25', '2024-11-13 07:04:25'),
(140, 1, 'update', '::1', 'General setting has been updated.', 1, '2024-11-13 07:05:41', '2024-11-13 07:05:41'),
(141, 1, 'delete', '::1', 'ID = 122 record has been deleted from menus.', 1, '2024-11-13 07:06:14', '2024-11-13 07:06:14'),
(142, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-13 10:05:40', '2024-11-13 10:05:40'),
(143, 1, 'add', '::1', 'Data Setting Menu has been added.', 1, '2024-11-13 10:08:28', '2024-11-13 10:08:28'),
(144, 1, 'update', '::1', 'ID = 170 record status has been changed to 1 from menus.', 1, '2024-11-13 10:08:39', '2024-11-13 10:08:39'),
(145, 1, 'add', '::1', 'Menu ID = 170 submenu Derivers has been added.', 1, '2024-11-13 10:09:15', '2024-11-13 10:09:15'),
(146, 1, 'add', '::1', 'Menu ID = 170 access has been assigned to Role ID = 1.', 1, '2024-11-13 10:09:48', '2024-11-13 10:09:48'),
(147, 1, 'add', '::1', 'Menu ID = 171 access has been assigned to Role ID = 1.', 1, '2024-11-13 10:10:00', '2024-11-13 10:10:00'),
(148, 1, 'update', '::1', 'ID = 171 record status has been changed to 1 from menus.', 1, '2024-11-13 10:10:25', '2024-11-13 10:10:25'),
(149, 1, 'update', '::1', 'Data Setting Menu has been added.', 1, '2024-11-13 10:11:09', '2024-11-13 10:11:09'),
(150, 1, 'update', '::1', 'Data Setting Menu has been added.', 1, '2024-11-13 10:11:42', '2024-11-13 10:11:42'),
(151, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 07:40:20', '2024-11-14 07:40:20'),
(152, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 08:12:46', '2024-11-14 08:12:46'),
(153, 1, 'add', '::1', 'Menu ID = 170 submenu driver has been added.', 1, '2024-11-14 08:14:19', '2024-11-14 08:14:19'),
(154, 1, 'update', '::1', 'Menu ID = 170 submenu Derivers has been updated.', 1, '2024-11-14 08:14:25', '2024-11-14 08:14:25'),
(155, 1, 'add', '::1', 'Menu ID = 170 submenu driver has been added.', 1, '2024-11-14 08:15:00', '2024-11-14 08:15:00'),
(156, 1, 'add', '::1', 'Menu ID = 172 access has been assigned to Role ID = 1.', 1, '2024-11-14 08:15:30', '2024-11-14 08:15:30'),
(157, 1, 'add', '::1', 'Menu ID = 173 access has been assigned to Role ID = 1.', 1, '2024-11-14 08:15:33', '2024-11-14 08:15:33'),
(158, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 08:50:13', '2024-11-14 08:50:13'),
(159, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 10:02:07', '2024-11-14 10:02:07'),
(160, 1, 'add', '::1', 'Menu ID = 170 submenu Cars has been added.', 1, '2024-11-14 10:16:38', '2024-11-14 10:16:38'),
(161, 1, 'add', '::1', 'Menu ID = 174 access has been assigned to Role ID = 1.', 1, '2024-11-14 10:17:32', '2024-11-14 10:17:32'),
(162, 1, 'update', '::1', 'ID = 174 record status has been changed to 1 from menus.', 1, '2024-11-14 10:18:07', '2024-11-14 10:18:07'),
(163, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 10:19:34', '2024-11-14 10:19:34'),
(164, 1, 'login', '::ffff:127.0.0.', 'Imran Azim is logged in.', 1, '2024-11-14 10:21:28', '2024-11-14 10:21:28'),
(165, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 10:23:04', '2024-11-14 10:23:04'),
(166, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 10:25:13', '2024-11-14 10:25:13'),
(167, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 10:27:17', '2024-11-14 10:27:17'),
(168, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 10:31:00', '2024-11-14 10:31:00'),
(169, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 10:42:58', '2024-11-14 10:42:58'),
(170, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 10:43:33', '2024-11-14 10:43:33'),
(171, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 10:46:17', '2024-11-14 10:46:17'),
(172, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 11:03:58', '2024-11-14 11:03:58'),
(173, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 11:07:29', '2024-11-14 11:07:29'),
(174, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 11:48:20', '2024-11-14 11:48:20'),
(175, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 11:50:07', '2024-11-14 11:50:07'),
(176, 1, 'delete', '::1', 'ID = 2 record has been deleted from drivers.', 1, '2024-11-14 12:07:31', '2024-11-14 12:07:31'),
(177, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 15:24:06', '2024-11-14 15:24:06'),
(178, 1, 'delete', '::1', 'ID = 3 record has been deleted from drivers.', 1, '2024-11-14 15:32:27', '2024-11-14 15:32:27'),
(179, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 15:44:22', '2024-11-14 15:44:22'),
(180, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 15:50:32', '2024-11-14 15:50:32'),
(181, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 16:18:39', '2024-11-14 16:18:39'),
(182, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 16:37:40', '2024-11-14 16:37:40'),
(183, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 16:54:24', '2024-11-14 16:54:24'),
(184, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 16:55:14', '2024-11-14 16:55:14'),
(185, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 16:57:27', '2024-11-14 16:57:27'),
(186, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 16:58:19', '2024-11-14 16:58:19'),
(187, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 17:09:57', '2024-11-14 17:09:57'),
(188, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 17:13:01', '2024-11-14 17:13:01'),
(189, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 17:37:27', '2024-11-14 17:37:27'),
(190, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 17:38:00', '2024-11-14 17:38:00'),
(191, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 17:38:59', '2024-11-14 17:38:59'),
(192, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 18:57:14', '2024-11-14 18:57:14'),
(193, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 19:28:43', '2024-11-14 19:28:43'),
(194, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 19:32:41', '2024-11-14 19:32:41'),
(195, 1, 'add', '::1', 'Menu ID = 170 submenu car has been added.', 1, '2024-11-14 19:33:50', '2024-11-14 19:33:50'),
(196, 1, 'add', '::1', 'Menu ID = 170 submenu car has been added.', 1, '2024-11-14 19:34:09', '2024-11-14 19:34:09'),
(197, 1, 'add', '::1', 'Menu ID = 170 submenu Bookings has been added.', 1, '2024-11-14 19:35:10', '2024-11-14 19:35:10'),
(198, 1, 'update', '::1', 'ID = 177 record status has been changed to 1 from menus.', 1, '2024-11-14 19:35:12', '2024-11-14 19:35:12'),
(199, 1, 'add', '::1', 'Menu ID = 175 access has been assigned to Role ID = 1.', 1, '2024-11-14 19:35:31', '2024-11-14 19:35:31'),
(200, 1, 'add', '::1', 'Menu ID = 176 access has been assigned to Role ID = 1.', 1, '2024-11-14 19:35:33', '2024-11-14 19:35:33'),
(201, 1, 'add', '::1', 'Menu ID = 177 access has been assigned to Role ID = 1.', 1, '2024-11-14 19:35:35', '2024-11-14 19:35:35'),
(202, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 19:37:45', '2024-11-14 19:37:45'),
(203, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 19:40:02', '2024-11-14 19:40:02'),
(204, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 19:42:17', '2024-11-14 19:42:17'),
(205, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 19:46:10', '2024-11-14 19:46:10'),
(206, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 19:53:55', '2024-11-14 19:53:55'),
(207, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 19:58:31', '2024-11-14 19:58:31'),
(208, 1, 'login', '::ffff:127.0.0.', 'Imran Azim is logged in.', 1, '2024-11-14 20:01:33', '2024-11-14 20:01:33'),
(209, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 20:07:11', '2024-11-14 20:07:11'),
(210, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 20:09:11', '2024-11-14 20:09:11'),
(211, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 20:10:59', '2024-11-14 20:10:59'),
(212, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-14 20:12:21', '2024-11-14 20:12:21'),
(213, 1, 'login', '::ffff:127.0.0.', 'Imran Azim is logged in.', 1, '2024-11-14 20:17:50', '2024-11-14 20:17:50'),
(214, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-15 06:38:46', '2024-11-15 06:38:46'),
(215, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-15 06:43:59', '2024-11-15 06:43:59'),
(216, 1, 'delete', '::1', 'ID = 1 record has been deleted from drivers.', 1, '2024-11-15 06:50:59', '2024-11-15 06:50:59'),
(217, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-15 07:03:37', '2024-11-15 07:03:37'),
(218, 1, 'delete', '::1', 'ID = 1 record has been deleted from cars.', 1, '2024-11-15 07:08:02', '2024-11-15 07:08:02'),
(219, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-15 07:10:33', '2024-11-15 07:10:33'),
(220, 1, 'delete', '::1', 'ID = 3 record has been deleted from cars.', 1, '2024-11-15 07:11:09', '2024-11-15 07:11:09'),
(221, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-15 07:19:46', '2024-11-15 07:19:46'),
(222, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-15 08:58:37', '2024-11-15 08:58:37'),
(223, 1, 'add', '::1', 'Menu ID = 170 submenu Driver_Car has been added.', 1, '2024-11-15 09:14:07', '2024-11-15 09:14:07'),
(224, 1, 'update', '::1', 'ID = 178 record status has been changed to 1 from menus.', 1, '2024-11-15 09:14:10', '2024-11-15 09:14:10'),
(225, 1, 'add', '::1', 'Menu ID = 170 submenu driver_car has been added.', 1, '2024-11-15 09:14:41', '2024-11-15 09:14:41'),
(226, 1, 'add', '::1', 'Menu ID = 170 submenu driver_car has been added.', 1, '2024-11-15 09:15:10', '2024-11-15 09:15:10'),
(227, 1, 'add', '::1', 'Menu ID = 178 access has been assigned to Role ID = 1.', 1, '2024-11-15 09:15:31', '2024-11-15 09:15:31'),
(228, 1, 'add', '::1', 'Menu ID = 179 access has been assigned to Role ID = 1.', 1, '2024-11-15 09:15:34', '2024-11-15 09:15:34'),
(229, 1, 'add', '::1', 'Menu ID = 180 access has been assigned to Role ID = 1.', 1, '2024-11-15 09:15:36', '2024-11-15 09:15:36'),
(230, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-15 10:01:09', '2024-11-15 10:01:09'),
(231, 1, 'update', '::1', 'Menu ID = 170 submenu driver_car has been updated.', 1, '2024-11-15 10:01:42', '2024-11-15 10:01:42'),
(232, 1, 'update', '::1', 'Menu ID = 170 submenu driver_car has been updated.', 1, '2024-11-15 10:01:49', '2024-11-15 10:01:49'),
(233, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-15 10:05:24', '2024-11-15 10:05:24'),
(234, 1, 'login', '::1', 'Imran Azim is logged in.', 1, '2024-11-15 10:32:52', '2024-11-15 10:32:52');

-- --------------------------------------------------------

--
-- Table structure for table `cars`
--

CREATE TABLE `cars` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `registration_no` varchar(255) NOT NULL,
  `vehicle_type` varchar(255) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `car_status` tinyint(4) DEFAULT 1,
  `status` tinyint(4) DEFAULT 1,
  `isDeleted` tinyint(4) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cars`
--

INSERT INTO `cars` (`id`, `title`, `registration_no`, `vehicle_type`, `image_url`, `description`, `car_status`, `status`, `isDeleted`, `createdAt`, `updatedAt`) VALUES
(1, 'Mustang', 'P1', 'sedans', 'uploads/admin/cars/1731667604.488car.webp', '<p>test data</p>', 1, 1, 0, '2024-11-15 10:46:45', '2024-11-15 10:46:45'),
(2, 'BMW', 'P2', 'SUV', 'uploads/admin/cars/1731667640.154car.webp', 'testing data for checking', 1, 1, 0, '2024-11-15 10:47:20', '2024-11-15 10:47:20'),
(3, 'Ford', 'P3', 'Truck', 'uploads/admin/cars/1731667707.318car.webp', 'testing......', 1, 1, 0, '2024-11-15 10:48:27', '2024-11-15 10:48:27');

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--

CREATE TABLE `complaints` (
  `id` int(11) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('pending','resolved','rejected') DEFAULT 'pending',
  `isDeleted` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE `drivers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `contact` varchar(255) NOT NULL,
  `license_no` varchar(255) NOT NULL,
  `id_card_no` varchar(255) NOT NULL,
  `passport_no` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `dob` varchar(255) DEFAULT NULL,
  `driver_status` tinyint(4) DEFAULT 1,
  `description` text DEFAULT NULL,
  `status` tinyint(4) DEFAULT 1,
  `isDeleted` tinyint(4) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `drivers`
--

INSERT INTO `drivers` (`id`, `name`, `contact`, `license_no`, `id_card_no`, `passport_no`, `address`, `dob`, `driver_status`, `description`, `status`, `isDeleted`, `createdAt`, `updatedAt`) VALUES
(1, 'Jhon', '112211', '1111', '2212', '15555', 'Washtown area 64 plot', '2024-11-16', 1, '<p>testing&nbsp;</p>', 1, 0, '2024-11-15 10:42:27', '2024-11-15 10:42:27'),
(2, 'MasterMind', '1234567890', '223132', '45676465', '43523542435', 'House no 1 street no 1 Khushal Colony huwai raod  ', '2024-11-29', 1, 'for testing the flow', 1, 0, '2024-11-15 10:43:05', '2024-11-15 10:43:05'),
(3, 'waleed', '1242354235', '00909000', '1221', '43523542435', 'Washtown area 64 plot ', '2024-11-21', 1, 'qwertyuiop lkjhgfdsa zxcvbnm', 1, 0, '2024-11-15 10:43:50', '2024-11-15 10:43:50'),
(4, 'khan', '00010001', '000010', '110011001', '0001011111', 'asdfghjk', '2024-11-23', 1, 'checking data', 1, 0, '2024-11-15 10:46:11', '2024-11-15 10:46:11');

-- --------------------------------------------------------

--
-- Table structure for table `drivers_cars`
--

CREATE TABLE `drivers_cars` (
  `id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `assignment_date` datetime DEFAULT NULL,
  `is_available` tinyint(4) DEFAULT 1,
  `description` text DEFAULT NULL,
  `status` tinyint(4) DEFAULT 1,
  `isDeleted` tinyint(4) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `feedbacks`
--

CREATE TABLE `feedbacks` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `email` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menus`
--

CREATE TABLE `menus` (
  `id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT 0,
  `title` varchar(255) NOT NULL,
  `route` varchar(255) DEFAULT '''#''',
  `slug` varchar(255) NOT NULL,
  `query_param` varchar(255) DEFAULT NULL,
  `icon` varchar(255) DEFAULT 'fe fe-file-minus	',
  `sort` int(11) DEFAULT 0,
  `type` enum('main-menu','sub-menu','other') DEFAULT 'other',
  `status` tinyint(4) DEFAULT 1,
  `isDeleted` tinyint(4) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `menus`
--

INSERT INTO `menus` (`id`, `parent_id`, `title`, `route`, `slug`, `query_param`, `icon`, `sort`, `type`, `status`, `isDeleted`, `createdAt`, `updatedAt`) VALUES
(1, 0, 'Home', 'home', '#', NULL, 'fe fe-home', 1, 'main-menu', 1, 0, '2023-01-02 18:25:18', '2023-01-03 10:57:23'),
(2, 0, 'Settings', 'settings', '#', NULL, 'fe fe-settings', 2, 'sub-menu', 1, 0, '2023-01-02 19:09:17', '2023-01-04 11:08:53'),
(3, 2, 'General', 'general-setting', 'list', NULL, 'fe fe-cirlce', 1, 'sub-menu', 1, 0, '2023-01-04 11:10:30', '2023-01-04 11:24:05'),
(4, 2, 'Menus', 'rbac', 'menus', NULL, 'fe fe-cirlce', 2, 'sub-menu', 1, 0, '2023-01-04 11:11:14', '2023-01-04 11:24:25'),
(5, 2, 'Roles', 'rbac', 'roles', NULL, 'fe fe-circle', 3, 'sub-menu', 1, 0, '2023-01-02 20:40:58', '2023-01-04 11:24:43'),
(6, 2, 'System Users', 'rbac', 'system-users', NULL, 'fe fe-cirlce', 4, 'sub-menu', 1, 0, '2023-01-04 11:12:38', '2023-01-04 11:24:53'),
(25, 0, 'Users', 'users', '#', NULL, 'fe fe-users', 12, 'sub-menu', 1, 0, '2023-01-04 11:39:29', '2023-01-04 11:39:29'),
(26, 25, 'Social Users', 'social-users', 'list', NULL, 'fe fe-circle', 1, 'sub-menu', 1, 0, '2023-01-04 11:40:58', '2023-01-27 06:54:36'),
(28, 0, 'Complaints', 'complaint', 'list', NULL, 'fe fe-file-minus', 14, 'main-menu', 1, 0, '2023-01-04 11:42:49', '2023-01-04 11:42:49'),
(29, 0, 'Feedback', 'feedback', 'list', NULL, 'fe fe-file-plus', 15, 'main-menu', 1, 0, '2023-01-04 11:43:16', '2023-01-04 11:43:16'),
(30, 0, 'General (edit, delete, view, status, feature)', 'general', '#', NULL, 'fe fe-cirlce', 0, 'other', 0, 0, '2023-01-06 21:23:59', '2023-01-09 21:28:31'),
(31, 30, 'General Edit', 'general', 'edit', NULL, 'fe fe-circle', 1, 'other', 0, 0, '2023-01-06 21:25:13', '2023-01-09 21:12:43'),
(32, 30, 'General Delete', 'general', 'delete', NULL, 'fe fe-circle', 2, 'other', 0, 0, '2023-01-06 21:25:30', '2023-01-09 21:09:17'),
(33, 30, 'General Status Change', 'general', 'status', NULL, 'fe fe-circle', 3, 'other', 0, 0, '2023-01-06 21:26:01', '2023-01-09 21:09:28'),
(34, 0, 'Profile Setting', 'profile', 'edit', NULL, 'fe fe-cirlce', 0, 'other', 0, 0, '2023-01-07 20:15:08', '2023-01-09 21:07:14'),
(35, 34, 'Update Profile', 'profile', 'update-profile', NULL, 'fe fe-circle', 1, 'other', 0, 0, '2023-01-07 20:16:26', '2023-01-09 21:08:11'),
(36, 34, 'Change Password', 'profile', 'update-profile-password', NULL, 'fe fe-circle', 2, 'other', 0, 0, '2023-01-07 20:17:57', '2023-01-09 21:08:16'),
(60, 30, 'General View', 'general', 'view', NULL, 'fe fe-circle', 4, 'other', 0, 0, '2023-01-09 21:11:15', '2023-01-09 21:20:32'),
(61, 30, 'General Feature Change', 'general', 'feature', NULL, 'fe fe-circle', 5, 'other', 0, 0, '2023-01-09 21:12:06', '2023-01-09 21:20:40'),
(90, 30, 'General Top Change', 'general', 'top-status', NULL, 'fe fe-circle', 6, 'other', 0, 0, '2023-01-13 10:51:46', '2023-01-13 10:51:46'),
(94, 1, 'Total Counts', 'home', 'total-count', NULL, 'fe fe-circle', 1, 'main-menu', 0, 0, '2023-01-25 09:48:20', '2023-01-25 09:48:20'),
(96, 25, 'Social User View', 'social-users', 'view', NULL, 'fe fe-circle', 2, 'sub-menu', 0, 0, '2023-01-27 06:56:30', '2023-01-27 06:56:30'),
(107, 30, 'Settings Update', 'general-setting', 'update', NULL, 'fe fe-circle', 6, 'other', 0, 0, '2023-01-30 11:11:41', '2023-01-30 11:11:41'),
(108, 2, 'Pages', 'page', 'list', '', 'fe fe-circle', 5, 'sub-menu', 1, 0, '2023-01-30 13:26:14', '2024-11-13 06:57:34'),
(109, 0, 'Pages', 'page', 'list', NULL, 'fe fe-cirlce', 0, 'other', 0, 0, '2023-01-30 13:27:39', '2023-01-30 13:27:39'),
(110, 109, 'Page Add', 'page', 'add', NULL, 'fe fe-circle', 1, 'other', 0, 0, '2023-01-30 13:28:06', '2023-01-30 13:28:06'),
(111, 109, 'Page Update', 'page', 'update', NULL, 'fe fe-circle', 2, 'other', 0, 0, '2023-01-30 13:28:17', '2023-01-30 13:28:17'),
(112, 109, 'Page View', 'page', 'view', NULL, 'fe fe-circle', 3, 'other', 0, 0, '2023-01-30 13:28:31', '2023-01-30 13:28:31'),
(124, 0, 'Downloads', 'download', '#', NULL, 'fe fe-aperture', 20, 'sub-menu', 1, 0, '2023-02-23 05:43:14', '2024-11-13 06:55:17'),
(128, 124, 'Documents', 'download', 'document', '', 'fe fe-circle', 1, 'sub-menu', 1, 0, '2023-02-23 05:44:46', '2024-11-13 07:00:53'),
(129, 124, 'Documents Add', 'download', 'document-add', '', 'fe fe-circle', 2, 'sub-menu', 0, 0, '2023-02-23 05:45:03', '2024-11-13 07:01:01'),
(130, 124, 'Documents Update', 'download', 'document-update', '', 'fe fe-circle', 3, 'sub-menu', 0, 0, '2023-02-23 05:45:21', '2024-11-13 07:00:43'),
(139, 25, 'Social Users Update', 'social-users', 'update', NULL, 'fe fe-circle', 3, 'sub-menu', 0, 0, '2023-03-16 11:53:35', '2023-03-16 11:53:35'),
(161, 2, 'Activity Logs', 'general-setting', 'activity-logs', '', 'fe fe-circle', 6, 'sub-menu', 1, 0, '2023-08-15 14:18:17', '2024-11-13 06:57:41'),
(170, 0, 'Data Setting', 'data-settings', '#', NULL, 'fe fe-settings', 3, 'sub-menu', 1, 0, '2024-11-13 10:08:28', '2024-11-13 10:11:42'),
(171, 170, 'Derivers', 'drivers', 'list', '', 'fe fe-circle', 1, 'sub-menu', 1, 0, '2024-11-13 10:09:15', '2024-11-14 08:14:25'),
(172, 170, 'driver', 'drivers', 'add', '', 'fe fe-circle', 0, 'sub-menu', 0, 0, '2024-11-14 08:14:19', '2024-11-14 08:14:19'),
(173, 170, 'driver', 'drivers', 'update', '', 'fe fe-circle', 0, 'sub-menu', 0, 0, '2024-11-14 08:15:00', '2024-11-14 08:15:00'),
(174, 170, 'Cars', 'cars', 'list', '', 'fe fe-circle', 2, 'sub-menu', 1, 0, '2024-11-14 10:16:38', '2024-11-14 10:16:38'),
(175, 170, 'car', 'cars', 'add', '', 'fe fe-circle', 0, 'sub-menu', 0, 0, '2024-11-14 19:33:50', '2024-11-14 19:33:50'),
(176, 170, 'car', 'cars', 'update', '', 'fe fe-circle', 0, 'sub-menu', 0, 0, '2024-11-14 19:34:09', '2024-11-14 19:34:09'),
(177, 170, 'Bookings', 'bookings', 'list', '', 'fe fe-circle', 3, 'sub-menu', 1, 0, '2024-11-14 19:35:10', '2024-11-14 19:35:10'),
(178, 170, 'Driver_Car', 'driver-car', 'list', '', 'fe fe-circle', 4, 'sub-menu', 1, 0, '2024-11-15 09:14:07', '2024-11-15 09:14:07'),
(179, 170, 'driver_car', 'driver-car', 'add', '', 'fe fe-circle', 0, 'sub-menu', 0, 0, '2024-11-15 09:14:41', '2024-11-15 10:01:42'),
(180, 170, 'driver_car', 'driver-car', 'update', '', 'fe fe-circle', 0, 'sub-menu', 0, 0, '2024-11-15 09:15:10', '2024-11-15 10:01:49');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_by` int(11) DEFAULT NULL,
  `user_for` int(11) DEFAULT NULL,
  `source_id` int(11) DEFAULT NULL,
  `source` enum('new','user','seller','post','comment','reply','destination','district','attraction','poi','blog','tour_package','book_stay','social_event','local_product','itinerary','gallery','kp_investment') DEFAULT 'new',
  `action` enum('new','created','updated','deleted','viewed','edited','liked','commented','replied','shared','started following','unfollowed','pending','processing','accepted','rejected','requested') DEFAULT 'new',
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `is_single_read` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pages`
--

CREATE TABLE `pages` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `type` enum('header','footer','page') NOT NULL DEFAULT 'footer',
  `views_counter` int(11) NOT NULL DEFAULT 0,
  `status` tinyint(4) DEFAULT 1,
  `isDeleted` tinyint(4) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `pages`
--

INSERT INTO `pages` (`id`, `title`, `slug`, `image_url`, `description`, `type`, `views_counter`, `status`, `isDeleted`, `createdAt`, `updatedAt`) VALUES
(1, 'Privacy Policy', 'privacy-policy', 'uploads/admin/pages/1675153867.911Img.webp', '<p>We do not collect any information about you unless you choose to provide that information. We may share necessary data with other Government agencies and departments. However, information collected by us is used only for official purposes, internal reviews, improvement of the content of our Website, customization of the content and layout of our Website and to contact users. We do not use, share or pass on your information for commercial purposes.</p><p>All record keepers face the possibility of disclosure of their records in some civil, criminal, or administrative matter. Government of Khyber Pakhtunkhwa could be required to disclose personal information in response to valid legal processes such as a search warrant, subpoena, or court order. Disclosures may also be necessary to protect the Government\'s legal rights or during emergencies if physical safety is believed to be at risk.</p><p><b>What Information About Users Does Collect?</b></p><p>We consider any information that could reasonably be used to identify you as \"personally identifying information.\" The Government of Khyber Pakhtunkhwa does not retain personally identifiable information about you when you visit our Website unless you choose to provide such information to us (i.e. sending an e-mail, registering as a user, participating in a survey, responding to a feedback or \"contact us\" form, etc.)</p><p>Government departments, agencies and organizations may request personally identifiable information from you in order to provide requested services however, such information is handled as in the case of an in-person visit to that same department, agency or organization.</p><p><b>E-Mail Communications and Web Forms</b></p><p>If you send us an electronic mail message with a question or comment that contains personally identifying information, or fill out a form that e-mails us information, we will use this personally identifying information only to respond to your request. We may redirect your message to another government agency or person who is in a better position to respond to your query or comment.</p><div>All e-mail messages received contain the e-mail addresses of persons who voluntarily communicated with or requested information from us. Your e-mail addresses are not sold, leased or shared with any non-governmental or commercial entities without the user\'s consent. When a user has given us their e-mail address for purposes of communicating with or requesting information from us, that communication becomes part of the public record and may be subject to public inspection and copying if not protected by law.</div><div>Information submitted via e-mail or web forms may be at risk of being intercepted, read or modified. You are advised not to pass on any personal and confidential information such as security passwords and credit card numbers while using this Website unless specifically required by an authorized person. Government of Khyber Pakhtunkhwa shall not be liable for any misuse or loss of any such information.</div><div><br></div><div><div><b>Is User Information Shared?</b></div><div><b><br></b></div><div>Except as provided by applicable laws, we do not collect, use or disclose user information without the user\'s knowledge and approval. We do not share user information with third parties unless we have informed users about the disclosures or have prior consent.</div><div><br></div><div><b>Can I Access and Correct My Personal Information?</b></div><div><b><br></b></div><div>Users concerned about information contained in their personal records should contact the custodian of the record, which typically is the governmental entity that collects and maintains the information. You may request changes or annotate your personal information if you believe it to be inaccurate by submitting a written request describing the error.</div><div>The Government of Khyber Pakhtunkhwa does not collect any personally identifiable information other than what you provide. The automatic data recorded is not matched with any of that personally identifiable information, therefore information cannot be provided about your visit.</div><div><br></div><div><b>Links to other Sites</b></div><div><b><br></b></div><div>This Website may include links to websites operated by other government agencies, non-profit organizations and private businesses. When you link to another site, this Privacy Policy will not apply, however, you may be subject to the Privacy Policy of that new website, if one exists. The Government of Khyber Pakhtunkhwa is not in any way responsible for the privacy practices or content of external websites.</div><div><br></div><div><b>Policy Revision and Notification of Changes</b></div><div><b><br></b></div><div>The Government of Khyber Pakhtunkhwa reserves all rights to deny or restrict access to this Website to any particular person(s) or persons belonging to any geographical location or country or to block access from a particular Internet address at any time without assigning any reasons.</div></div>', 'footer', 180, 1, 0, '2023-01-30 00:00:00', '2024-06-04 20:15:52'),
(2, 'Terms & Conditions', 'terms-conditions', 'uploads/admin/pages/1675156049.489Dudipatsar-01-1.webp', '<p><b>Terms of Use</b></p><p>Thank you for visiting&nbsp;<a href=\"https://kptourism.com\" target=\"_blank\">KPCTA</a>. By accessing and using this Website you shall be deemed to have accepted and be legally bound by these Terms and Conditions. Your acceptance of the Terms and Conditions shall take effect from the time and date when you first access this Website.</p><p><b>Policy Revision</b></p><p>We may at any time revise these Terms and Conditions without notice. Your acceptance of the revised Terms and Conditions shall take effect from the time and date when you first access this Website following the revision of the Terms and Conditions.</p><p><b>Using&nbsp;&nbsp;</b><a href=\"https://kptourism.com\" target=\"_blank\">KPCTA</a></p><p>You agree to use this Website only for lawful purposes. You agree not to harass or cause distress or inconvenience to any person, or transmit illegal, prohibited, defamatory, obscene or offensive content or information and content which otherwise violates any law.</p><p><b>Disclaimer</b></p><p>The Government of Khyber Pakhtunkhwa, its agents, officers and employees</p><p>Make no representations, express or implied, as to the accuracy, quality, completeness, security of the information and data contained on this Website</p><p>Do not warrant that the functions contained in this Website will be uninterrupted or error free and that defects will be corrected</p><p>Make no representations, express or implied, as to the accuracy or usefulness of any information on this Website or any websites linked from or to this Website;</p><p>Make no representations, express or implied, as to the suitability or usefulness of the said information and data for any particular purpose</p><p>Make no warranties that this Website, the information and data and the hosting servers are free of infection by computer viruses or other contamination.</p><p>Do not sponsor, endorse or necessarily approve of any material on websites linked from or to this Website.</p><p>Do not make any warranties or representations regarding the quality, accuracy, merchantability or fitness for purpose of any material on websites linked from or to this Website.</p><p>Do not make any warranties or representations that material on other websites linked from or to this Website do not infringe the intellectual property rights of any person anywhere in the world</p><p>Accept no liability for direct, indirect, special, punitive, incidental, exemplary or consequential damages arising out of accessing or using this Website and websites linked from or to this Website, or any use of the information and data or reliance placed on them</p><p><b>Copyright, Trademarks and Service marks</b></p><p>The material, contents, service marks and trademarks contained in or displayed on this Website or websites to or from which this Website is linked are the property of their respective owners and are protected by intellectual property rights laws. The designs, information, graphics, images, logos and the selection and arrangements thereof on this Website, are the property of the Government of Khyber Pakhtunkhwa .</p><p>Permission is granted to residents and citizens of Pakistan to copy electronically and to print single pages of the copyright material belonging to Government of Khyber Pakhtunkhwa from this Website without any deletion, addition or modification and for the sole purpose of sharing information with other citizens and residents without cost to them.</p><p>This permission to reproduce material does not extend to any material on this Website or any website to or from which this Website is linked which is the copyright of any party other than the Government of Khyber Pakhtunkhwa.</p><p><b>Communication through the Site</b></p><p>You are notified that in communicating through this Website you may be in breach of applicable laws in case if you do any of the following:</p><p>Breaking the laws - this includes defamation, condoning illegal activity and contempt of court.</p><ul><li>Spamming.</li><li>Advertising.</li><li>Impersonating or falsely claiming to represent a person or organization.</li><li>Invading people\'s privacy.</li><li>Political campaigning.</li><li>Incitement to religious, ethnic or sectarian unrest or violence, and</li><li>Use of violence, intimidation or terrorism.</li></ul><p><b><br></b></p><p><b>Links to External Web Sites</b></p><p>This Website contains links to other web sites, which are not maintained by us or under our control. We are not responsible for the content of any such linked websites. We cannot guarantee that these links will work all of the time and have no control over the availability of the linked pages.</p><p>Your linking to any part of this Website or its contents constitute acceptance of these Terms and Conditions. You must secure permission from the Government of Khyber Pakhtunkhwa prior to hyper-linking to or framing any of its contents. Government of Khyber Pakhtunkhwa reserves the right without notice, to disable any unauthorized links or links to or frames of any website containing unlawful, infringing, defamatory or obscene material or information.</p><p><b>Variance of Content</b></p><p>In case of any variance between the contents of what is stated on this Website or the websites of the ministries and departments linked to or from this Website and that contained in the original source of such content, the latter shall prevail.</p><p><b>Registration</b></p><p>Certain portions of the Website are limited to registered users. You agree that the personal information provided to us for the purposes of registration shall be complete and accurate and that you will not register under the name of or attempt to enter the Website under the name of another person. The Government of Khyber Pakhtunkhwa may, in its sole discretion and without assigning any reasons, decline to register a user or disallow a user name that the Government deems offensive or inappropriate for any reason.</p><p><b>Right of Access</b></p><p>The Government of Khyber Pakhtunkhwa reserves all rights to deny or restrict access to this Website to any particular person(s) or persons belonging to any geographical location or country or to block access from a particular Internet address at any time without assigning any reasons.</p><p><b>Indemnification</b></p><p>You agree to indemnify and hold harmless the Government of Khyber Pakhtunkhwa against any loss, liability, claim, demand, damage, or expenses arising from or in connection with any breach by you of these Terms and Conditions.</p><p><b>Virus Protection</b></p><p>Whilst we make every effort to run virus checks on materials and information contained on this Website, it is advisable to run an anti-virus program on all material downloaded from this Website. We do not accept any responsibility for any loss, disruption or damage to your data or your computer system which may occur whilst using material derived from this Website.</p><p><b>Privacy Policy</b></p><p>Our&nbsp;<a href=\"https://staging-admin.kptourism.com/api/site/page/get?slug=privacy_policy\" target=\"_blank\">Privacy Policy</a> explains how we protect and respect the data we collect from you.</p><p><b>Governing Law and Jurisdiction</b></p><p>These Terms and Conditions shall be governed by and construed in accordance with the laws of Pakistan. Any dispute arising under the Terms and Conditions shall be subject to the exclusive jurisdiction of the courts of Pakistan.</p>', 'footer', 164, 1, 0, '2023-01-30 13:30:16', '2024-06-04 20:46:58'),
(3, 'About Us', 'about-us', 'uploads/admin/pages/1683095462.971Fu4LagqaMAE2agm.webp', '<p>Official website of Tourism Department Khyber Pakhtunkhwa, Govt. of Khyber Pakhtunkhwa. Content listed on the website is intended for information only. </p><p><b>\r\nPeshawar Head Office KPCTA\r\nAddress: </b></p><p>Olympic plaza, Peshawar Sports Complex, Stadium Road, Peshawar Cantt.\r\nEmail: info@kptourism.com\r\nTel: 091-9211091\r\nFax: 091-9210871\r\n</p><p><b>TFC Dungagali\r\nAddress: </b></p><p>Nathia Gali Rd, Dunga Gali, Abbottabad, Khyber Pakhtunkhwa, Pakistan.\r\nTel: 0300-9898557 | 0992 355173\r\n</p><p><b>TFC Peshawar\r\nAddress: </b></p><p>Tourism Wing Nishtar Hall, Peshawar.\r\nTel: +92 347 1110644 | 091 9213762\r\n</p><p><b>TFC Abbottabad\r\nAddress: </b></p><p>Muslim Abad (Silhad) Near Abbottabad motorway Interchange .\r\nTel: +92 343 9461169\r\n</p><p><b>TFC Dir\r\nAddress: </b></p><p>Al Manzir Hotel Main Road Dir Upper .\r\nTel: +92 345 4433979\r\n</p><p><b>TFC Chitral\r\nAddress: </b></p><p>Main Bazar Near Mountain Inn Hotel.\r\nTel: +92 300 5027713 | 0943 412800\r\n</p><p><b>TFC Chitral Airport\r\nAddress: </b></p><p>Chitral Airport.\r\nTel: 0345-8926871</p>', 'header', 134, 1, 0, '2023-05-03 06:31:03', '2024-06-02 09:45:17');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `permission` enum('read','write','admin') DEFAULT 'read',
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `isDeleted` tinyint(4) NOT NULL DEFAULT 0,
  `createdAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `title`, `permission`, `status`, `isDeleted`, `createdAt`, `updatedAt`) VALUES
(1, 'Administrator', 'admin', 1, 0, '2022-12-14 18:22:52', '2023-01-06 08:19:39'),
(3, 'Developer', 'read', 1, 0, '2023-01-06 10:04:13', '2023-01-06 10:04:13'),
(4, 'Data Entry Operator', 'read', 1, 0, '2023-09-20 08:43:10', '2023-09-20 08:43:10');

-- --------------------------------------------------------

--
-- Table structure for table `role_menus`
--

CREATE TABLE `role_menus` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `menu_id` int(11) NOT NULL,
  `action` enum('add','update','read','delete') DEFAULT 'read',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `role_menus`
--

INSERT INTO `role_menus` (`id`, `role_id`, `menu_id`, `action`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, 'read', '2023-01-06 08:14:12', '2023-01-06 08:14:12'),
(2, 1, 2, 'read', '2023-01-06 08:14:18', '2023-01-06 08:14:18'),
(3, 1, 3, 'read', '2023-01-06 08:14:24', '2023-01-06 08:14:24'),
(4, 1, 4, 'read', '2023-01-06 08:14:30', '2023-01-06 08:14:30'),
(5, 1, 5, 'read', '2023-01-06 08:14:34', '2023-01-06 08:14:34'),
(6, 1, 6, 'read', '2023-01-06 08:14:37', '2023-01-06 08:14:37'),
(23, 1, 25, 'read', '2023-01-06 08:15:36', '2023-01-06 08:15:36'),
(24, 1, 26, 'read', '2023-01-06 08:15:40', '2023-01-06 08:15:40'),
(26, 1, 28, 'read', '2023-01-06 08:15:47', '2023-01-06 08:15:47'),
(27, 1, 29, 'read', '2023-01-06 08:15:50', '2023-01-06 08:15:50'),
(49, 3, 1, 'read', '2023-01-06 10:06:56', '2023-01-06 10:06:56'),
(65, 1, 30, 'read', '2023-01-06 21:26:58', '2023-01-06 21:26:58'),
(66, 1, 31, 'read', '2023-01-06 21:27:02', '2023-01-06 21:27:02'),
(67, 1, 32, 'read', '2023-01-06 21:27:05', '2023-01-06 21:27:05'),
(68, 1, 33, 'read', '2023-01-06 21:27:08', '2023-01-06 21:27:08'),
(69, 3, 30, 'read', '2023-01-06 21:39:00', '2023-01-06 21:39:00'),
(70, 3, 31, 'read', '2023-01-06 21:39:15', '2023-01-06 21:39:15'),
(71, 3, 32, 'read', '2023-01-06 21:39:19', '2023-01-06 21:39:19'),
(72, 3, 33, 'read', '2023-01-06 21:39:23', '2023-01-06 21:39:23'),
(73, 1, 34, 'read', '2023-01-07 20:20:22', '2023-01-07 20:20:22'),
(74, 1, 35, 'read', '2023-01-07 20:20:26', '2023-01-07 20:20:26'),
(75, 1, 36, 'read', '2023-01-07 20:20:29', '2023-01-07 20:20:29'),
(79, 3, 34, 'read', '2023-01-07 20:24:44', '2023-01-07 20:24:44'),
(80, 3, 35, 'read', '2023-01-07 20:24:48', '2023-01-07 20:24:48'),
(81, 3, 36, 'read', '2023-01-07 20:24:53', '2023-01-07 20:24:53'),
(122, 1, 60, 'read', '2023-01-10 07:14:55', '2023-01-10 07:14:55'),
(123, 1, 61, 'read', '2023-01-10 07:14:58', '2023-01-10 07:14:58'),
(164, 1, 90, 'read', '2023-01-13 10:52:05', '2023-01-13 10:52:05'),
(169, 1, 94, 'read', '2023-01-25 09:48:33', '2023-01-25 09:48:33'),
(171, 3, 94, 'read', '2023-01-25 09:49:50', '2023-01-25 09:49:50'),
(174, 1, 96, 'read', '2023-01-27 06:56:41', '2023-01-27 06:56:41'),
(186, 1, 107, 'read', '2023-01-30 11:11:52', '2023-01-30 11:11:52'),
(187, 1, 108, 'read', '2023-01-30 13:26:45', '2023-01-30 13:26:45'),
(188, 1, 109, 'read', '2023-01-30 13:28:42', '2023-01-30 13:28:42'),
(189, 1, 110, 'read', '2023-01-30 13:28:45', '2023-01-30 13:28:45'),
(190, 1, 111, 'read', '2023-01-30 13:28:48', '2023-01-30 13:28:48'),
(191, 1, 112, 'read', '2023-01-30 13:28:50', '2023-01-30 13:28:50'),
(221, 1, 124, 'read', '2023-02-23 05:45:57', '2023-02-23 05:45:57'),
(225, 1, 128, 'read', '2023-02-23 05:46:06', '2023-02-23 05:46:06'),
(226, 1, 129, 'read', '2023-02-23 05:46:08', '2023-02-23 05:46:08'),
(227, 1, 130, 'read', '2023-02-23 05:46:09', '2023-02-23 05:46:09'),
(250, 1, 139, 'read', '2023-03-16 11:55:34', '2023-03-16 11:55:34'),
(284, 1, 161, 'read', '2023-08-15 14:18:25', '2023-08-15 14:18:25'),
(287, 4, 1, 'read', '2023-09-20 09:32:30', '2023-09-20 09:32:30'),
(288, 4, 94, 'read', '2023-09-20 09:32:47', '2023-09-20 09:32:47'),
(290, 4, 2, 'read', '2023-09-20 09:33:42', '2023-09-20 09:33:42'),
(291, 4, 3, 'read', '2023-09-20 09:34:52', '2023-09-20 09:34:52'),
(297, 4, 108, 'read', '2023-09-20 09:37:56', '2023-09-20 09:37:56'),
(298, 4, 109, 'read', '2023-09-20 09:38:09', '2023-09-20 09:38:09'),
(299, 4, 110, 'read', '2023-09-20 09:38:17', '2023-09-20 09:38:17'),
(300, 4, 111, 'read', '2023-09-20 09:38:23', '2023-09-20 09:38:23'),
(301, 4, 112, 'read', '2023-09-20 09:38:29', '2023-09-20 09:38:29'),
(302, 4, 30, 'read', '2023-09-20 09:52:29', '2023-09-20 09:52:29'),
(303, 4, 31, 'read', '2023-09-20 09:52:36', '2023-09-20 09:52:36'),
(351, 4, 32, 'read', '2023-09-20 09:57:37', '2023-09-20 09:57:37'),
(352, 4, 33, 'read', '2023-09-20 09:57:40', '2023-09-20 09:57:40'),
(353, 4, 60, 'read', '2023-09-20 09:57:43', '2023-09-20 09:57:43'),
(354, 4, 61, 'read', '2023-09-20 09:57:46', '2023-09-20 09:57:46'),
(355, 4, 90, 'read', '2023-09-20 09:57:49', '2023-09-20 09:57:49'),
(358, 4, 107, 'read', '2023-09-20 09:58:02', '2023-09-20 09:58:02'),
(366, 4, 124, 'read', '2023-09-20 09:58:33', '2023-09-20 09:58:33'),
(370, 4, 128, 'read', '2023-09-20 09:58:45', '2023-09-20 09:58:45'),
(371, 4, 129, 'read', '2023-09-20 09:58:48', '2023-09-20 09:58:48'),
(372, 4, 130, 'read', '2023-09-20 09:58:51', '2023-09-20 09:58:51'),
(388, 4, 34, 'read', '2023-09-20 09:59:52', '2023-09-20 09:59:52'),
(389, 4, 35, 'read', '2023-09-20 09:59:55', '2023-09-20 09:59:55'),
(390, 4, 36, 'read', '2023-09-20 09:59:58', '2023-09-20 09:59:58'),
(405, 4, 25, 'read', '2023-09-20 10:01:54', '2023-09-20 10:01:54'),
(482, 6, 1, 'read', '2024-06-03 05:31:11', '2024-06-03 05:31:11'),
(483, 6, 25, 'read', '2024-06-03 05:31:49', '2024-06-03 05:31:49'),
(486, 6, 34, 'read', '2024-06-03 05:33:16', '2024-06-03 05:33:16'),
(487, 6, 35, 'read', '2024-06-03 05:33:28', '2024-06-03 05:33:28'),
(488, 6, 36, 'read', '2024-06-03 05:33:36', '2024-06-03 05:33:36'),
(489, 1, 170, 'read', '2024-11-13 10:09:48', '2024-11-13 10:09:48'),
(490, 1, 171, 'read', '2024-11-13 10:10:00', '2024-11-13 10:10:00'),
(491, 1, 172, 'read', '2024-11-14 08:15:30', '2024-11-14 08:15:30'),
(492, 1, 173, 'read', '2024-11-14 08:15:33', '2024-11-14 08:15:33'),
(493, 1, 174, 'read', '2024-11-14 10:17:32', '2024-11-14 10:17:32'),
(494, 1, 175, 'read', '2024-11-14 19:35:31', '2024-11-14 19:35:31'),
(495, 1, 176, 'read', '2024-11-14 19:35:33', '2024-11-14 19:35:33'),
(496, 1, 177, 'read', '2024-11-14 19:35:35', '2024-11-14 19:35:35'),
(497, 1, 178, 'read', '2024-11-15 09:15:31', '2024-11-15 09:15:31'),
(498, 1, 179, 'read', '2024-11-15 09:15:34', '2024-11-15 09:15:34'),
(499, 1, 180, 'read', '2024-11-15 09:15:36', '2024-11-15 09:15:36');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `logo_color` varchar(255) DEFAULT NULL,
  `logo_white` varchar(255) DEFAULT NULL,
  `mobile_logo_small` varchar(255) DEFAULT NULL,
  `mobile_logo_large` varchar(255) DEFAULT NULL,
  `section1_text` varchar(255) DEFAULT NULL,
  `section1_description` varchar(255) DEFAULT NULL,
  `email1` varchar(100) DEFAULT NULL,
  `email2` varchar(100) DEFAULT NULL,
  `address1` varchar(255) DEFAULT NULL,
  `address2` varchar(255) DEFAULT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `map_address` text DEFAULT NULL,
  `twitter_link` varchar(255) DEFAULT NULL,
  `facebook_link` varchar(255) DEFAULT NULL,
  `youtube_link` varchar(255) DEFAULT NULL,
  `instagram_link` varchar(255) DEFAULT NULL,
  `andriod_app_link` varchar(255) DEFAULT NULL,
  `ios_app_link` varchar(255) DEFAULT NULL,
  `copyright_text` varchar(255) DEFAULT NULL,
  `organization_name` varchar(255) DEFAULT NULL,
  `status` tinyint(4) DEFAULT 1,
  `isDeleted` tinyint(4) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `logo_color`, `logo_white`, `mobile_logo_small`, `mobile_logo_large`, `section1_text`, `section1_description`, `email1`, `email2`, `address1`, `address2`, `contact_no`, `map_address`, `twitter_link`, `facebook_link`, `youtube_link`, `instagram_link`, `andriod_app_link`, `ios_app_link`, `copyright_text`, `organization_name`, `status`, `isDeleted`, `createdAt`, `updatedAt`) VALUES
(1, 'uploads/admin/setting/1675077209.202-kpcta_logo_new.png', 'uploads/admin/setting/1675077209.203-kpcta_logo_new.png', NULL, 'uploads/admin/setting/1675077209.203-kpcta_logo_new.png', 'Tourism in KP', '', 'info@nextgcircle.com', 'support@nextgcircle.com', '10t floor, State Life Building, Saddar, Peshawar', '', '111-1111111', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.975538211935!2d71.5315813754229!3d33.99316207317938!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d91724d6c67fe9%3A0xd665bf07e21c63fd!2sKP%20Culture%20%26%20Tourism%20Authority!5e0!3m2!1sen!2s!4v1685435236184!5m2!1sen!2s', 'https://twitter.com/ngen', 'https://facebook.com/ngen', 'https://www.youtube.com/@ngen', 'https://www.instagram.com/ngen', '', '', 'NGEN Pvt. Ltd.', 'NGEN', 1, 0, '2022-12-22 00:00:00', '2024-11-13 07:05:41');

-- --------------------------------------------------------

--
-- Table structure for table `setting_images`
--

CREATE TABLE `setting_images` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) NOT NULL,
  `type` enum('image','section1','section2','section3','section4','section5') DEFAULT 'image',
  `status` tinyint(4) DEFAULT 1,
  `isDeleted` tinyint(4) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `uuid` char(36) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `mobile_no` varchar(255) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `profile_image_thumb` varchar(255) DEFAULT NULL,
  `background_image` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `is_approved` tinyint(4) DEFAULT NULL,
  `user_type` enum('admin','admin_editor','admin_reader','user','guest') DEFAULT 'user',
  `is_notification` tinyint(1) NOT NULL DEFAULT 1,
  `register_from` varchar(10) DEFAULT 'site',
  `provider` varchar(20) NOT NULL DEFAULT 'local',
  `token` varchar(255) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `mobile_token` varchar(255) DEFAULT NULL,
  `reset_mobile_token` varchar(255) DEFAULT NULL,
  `mobile_device_token` varchar(255) DEFAULT NULL,
  `verify_token` varchar(255) DEFAULT NULL,
  `verify_otp` varchar(255) DEFAULT NULL,
  `is_active` tinyint(4) DEFAULT 0,
  `last_login` datetime DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `cnic` varchar(20) DEFAULT NULL,
  `status` tinyint(4) DEFAULT NULL,
  `about` text DEFAULT NULL,
  `isDeleted` tinyint(4) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `role_id`, `uuid`, `username`, `password`, `email`, `name`, `mobile_no`, `profile_image`, `profile_image_thumb`, `background_image`, `gender`, `country`, `city`, `is_approved`, `user_type`, `is_notification`, `register_from`, `provider`, `token`, `reset_token`, `mobile_token`, `reset_mobile_token`, `mobile_device_token`, `verify_token`, `verify_otp`, `is_active`, `last_login`, `address`, `cnic`, `status`, `about`, `isDeleted`, `createdAt`, `updatedAt`) VALUES
(1, 1, '8031b743-7867-455d-81ea-4e6b5ccde1bb', 'imranazim99@gmail.com', '$2a$10$oDtSkM8EOls5lpGo/nKQeuDgY.hKoK1V8uHFSQNEdgRshsWl3/.bq', 'imranazim99@gmail.com', 'Imran Azim', '0316-9558584', 'uploads/admin/profile/1679048395.949imi.webp', 'uploads/admin/profile/1679048395.962imi.webp', NULL, 'male', NULL, NULL, 1, 'admin', 0, 'admin', 'local', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2024-06-03 05:59:29', NULL, NULL, 1, 'test', 0, '2022-12-01 00:00:00', '2024-06-03 06:01:06');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `cars`
--
ALTER TABLE `cars`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `drivers_cars`
--
ALTER TABLE `drivers_cars`
  ADD PRIMARY KEY (`id`),
  ADD KEY `car_id` (`car_id`),
  ADD KEY `driver_id` (`driver_id`);

--
-- Indexes for table `feedbacks`
--
ALTER TABLE `feedbacks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `menus`
--
ALTER TABLE `menus`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_by` (`user_by`),
  ADD KEY `user_for` (`user_for`);

--
-- Indexes for table `pages`
--
ALTER TABLE `pages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `role_menus`
--
ALTER TABLE `role_menus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `menu_id` (`menu_id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `setting_images`
--
ALTER TABLE `setting_images`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=235;

--
-- AUTO_INCREMENT for table `cars`
--
ALTER TABLE `cars`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `complaints`
--
ALTER TABLE `complaints`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `drivers`
--
ALTER TABLE `drivers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `drivers_cars`
--
ALTER TABLE `drivers_cars`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `feedbacks`
--
ALTER TABLE `feedbacks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `menus`
--
ALTER TABLE `menus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=181;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pages`
--
ALTER TABLE `pages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `role_menus`
--
ALTER TABLE `role_menus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=500;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `setting_images`
--
ALTER TABLE `setting_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=548;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `drivers_cars`
--
ALTER TABLE `drivers_cars`
  ADD CONSTRAINT `drivers_cars_ibfk_1` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `drivers_cars_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`user_for`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
