export default function HomeBackgroundVideo() {
  return (
    <div className="home-video-bg-container" aria-hidden="true">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/images/home.png"
        className="home-video-bg"
      >
        <source src="/home.mp4" type="video/mp4" />
      </video>
      <div className="home-video-overlay" />
    </div>
  );
}
