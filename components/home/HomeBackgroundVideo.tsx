export default function HomeBackgroundVideo() {
  return (
    <div className="home-video-bg-container" aria-hidden="true">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="home-video-bg"
      >
        <source src="/home.mp4" type="video/mp4" />
      </video>
      <div className="home-video-overlay" />
    </div>
  );
}
