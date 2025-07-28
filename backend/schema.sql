-- Kullanıcılar
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  role ENUM('superadmin', 'manager', 'dataentry', 'viewer')
);

-- Kampanyalar
CREATE TABLE campaigns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200),
  subject VARCHAR(200),
  sender_name VARCHAR(100),
  sender_email VARCHAR(100),
  content TEXT,
  status ENUM('draft', 'sent'),
  scheduled_at DATETIME,
  sent_at DATETIME
);

-- İletişim Listeleri
CREATE TABLE contact_lists (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100)
);

-- Kontaklar
CREATE TABLE contacts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100),
  organization VARCHAR(100),
  position VARCHAR(100),
  contact_list_id INT,
  FOREIGN KEY (contact_list_id) REFERENCES contact_lists(id)
);

-- Basın Üyeleri
CREATE TABLE press_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100),
  job_title VARCHAR(100),
  social_links TEXT
);

-- Kara Liste
CREATE TABLE blacklist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE,
  reason VARCHAR(255)
);