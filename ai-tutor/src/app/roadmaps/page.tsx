import Image from "next/image"; // Import Image if you want to use an image
import Navbar from '../components/Navbar'; // Import Navbar component

export default function Roadmaps() {
  return (
    <div>
      {/* Navbar Component */}
      <Navbar />

      {/* Main Content */}
      <div className="main-content">
        <h1>ROADMAPS</h1>
        <div className="boxes">
          <div className="box">CSC311</div>
          <div className="box">CSC207</div>
          <div className="box">+</div>
        </div>
      </div>

      {/* Footer */}
      <footer>
        <a href="#terms">Terms of Service</a>
        <a href="#privacy">Privacy Policy</a>
        <a href="#about">About Us</a>
      </footer>

      {/* Inline Styles (or you can use external CSS) */}
      <style jsx>{`
        /* General Body Style */
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Main Content Section */
        .main-content {
          text-align: center;
          padding: 40px 20px;
        }

        .main-content h1 {
          font-size: 36px;
          margin-bottom: 20px;
        }

        .boxes {
          display: flex;
          justify-content: center;
          gap: 20px;
        }

        .box {
          width: 150px;
          height: 150px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f0f0f0;
          border: 2px solid #ccc;
          font-size: 20px;
          font-weight: bold;
        }

        .box:hover {
          background-color: #e0e0e0;
          cursor: pointer;
        }

        /* Footer Section */
        footer {
          background-color: #333;
          color: white;
          text-align: center;
          padding: 20px 0;
        }

        footer a {
          color: white;
          text-decoration: none;
          margin: 0 15px;
          font-size: 14px;
        }

        footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
