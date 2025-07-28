import React from "react";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>PRConnect Admin Panel Demo</h1>
      <div className="overview">
        <div className="card">
          <h2>Aktif Kampanyalar</h2>
          <span>5</span>
        </div>
        <div className="card">
          <h2>Toplam Kontaklar</h2>
          <span>1500</span>
        </div>
        <div className="card">
          <h2>Son Gönderilen Bültenler</h2>
          <ul>
            <li>Ekonomi Gündemi – 26 Temmuz</li>
            <li>Teknoloji Trendleri – 25 Temmuz</li>
          </ul>
        </div>
      </div>
      <div className="quick-actions">
        <button>Yeni Kampanya Oluştur</button>
        <button>Yeni Kontak Ekle</button>
      </div>
      <div className="analytics">
        <h2>Genel Analitik</h2>
        <p>Açılma oranı: %38 | Tıklama oranı: %12 | Başarısızlık: %2</p>
      </div>
    </div>
  );
};

export default Dashboard;