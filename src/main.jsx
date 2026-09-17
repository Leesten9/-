import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, ArrowDown, ArrowUp, Plus, X, Menu, Pause, Play, Scan, Sparkles, Layers, MoveUpRight, Copy, Check, Mail } from 'lucide-react';
import { profile, projects, experience, previousExperience } from './data';
import SideRays from './components/SideRays';
import BorderGlow from './components/BorderGlow';
import './background.css';
import './styles.css';
import './hero.css';
import './about.css';
import { SectionTitle, Strengths, ContactSection } from './components/PortfolioSections';
import GlowCursor from './components/GlowCursor';
import ProfileCard from './components/ProfileCard';
import './palette.css';
import BrandWorks from './components/BrandWorks';

function App() {
  const [selected, setSelected] = useState(null);
  const [contact, setContact] = useState(false);
  const [menu, setMenu] = useState(false);
  const [paused, setPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [floatingNav, setFloatingNav] = useState(false);
  const [cursorEnabled, setCursorEnabled] = useState(false);
  const heroRef = useRef(null);
  const video = useRef(null);
  const closeRef = useRef(null);
  const modalOpen = Boolean(selected || contact);

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const update = () => setCursorEnabled(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const updateNavigation = () => {
      setFloatingNav(hero.getBoundingClientRect().bottom <= 72);
    };
    updateNavigation();
    window.addEventListener('scroll', updateNavigation, { passive: true });
    const observer = new ResizeObserver(updateNavigation);
    observer.observe(hero);
    return () => {
      window.removeEventListener('scroll', updateNavigation);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const previous = document.activeElement;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const keydown = (e) => {
      if (e.key === 'Escape') { setSelected(null); setContact(false); }
      if (e.key === 'Tab') {
        const nodes = [...document.querySelectorAll('.dialog button, .dialog a[href]')];
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [modalOpen]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPaused(true); video.current?.pause();
    }
  }, []);

  function toggleVideo() {
    if (paused) video.current?.play().catch(() => {});
    else video.current?.pause();
    setPaused(!paused);
  }
  async function copyContact() {
    try { await navigator.clipboard.writeText(profile.wechat || profile.email); setCopied(true); }
    catch { setCopied(false); }
  }
  const navigate = () => setMenu(false);
  return <>
    {cursorEnabled && <GlowCursor className="page-cursor" color="#e61a23" secondaryColor="#ce777b"
      trailLength={22} trailWidth={4} trailTaper={0.23} followSpeed={0.1}
      glowIntensity={1.75} glowSpread={1.15} hotspot={0.59} brightness={1.25}
      opacity={0.65} pulseSpeed={1.1} noiseStrength={0.035} idleFade
      idleTimeout={700} fadeDuration={900} blendMode="screen" maxDevicePixelRatio={1} />}
    <header className={`header${floatingNav ? ' header-floating' : ''}`}>
      <a className="wordmark" href="#home" aria-label="回到首页">YN<span className="wordmark-dot">.</span><span className="wordmark-caption">INDEPENDENT<br />DESIGNER</span></a>
      <nav className={menu ? 'navigation open' : 'navigation'} aria-label="主导航">
        <a href="#about" onClick={navigate}>关于我 <span>01</span></a>
        <a href="#work" onClick={navigate}>精选作品 <span>02</span></a>
        <a href="#expertise" onClick={navigate}>专业能力 <span>03</span></a>
      </nav>
      <a className="contact-link" href="#contact">一起创造 <ArrowUpRight size={17} /></a>
      <button className="menu-button icon-button" aria-label={menu ? '关闭导航' : '打开导航'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
    </header>

    <main>
      <section ref={heroRef} className={`hero ${paused ? 'is-paused' : ''}`} id="home">
        <div className="hero-media"><img src="/images/hero.png" alt="银色金属雕塑视觉实验" /><video ref={video} autoPlay muted loop playsInline poster="/images/hero.png" aria-hidden="true"><source src="/videos/hero-grain.mp4" type="video/mp4" /></video></div>
        <div className="hero-shade" />
        <div className="hero-content container">
          <div className="eyebrow"><span className="status-dot" /> INDEPENDENT DESIGNER / AI EXPLORER</div>
          <h1><span className="hero-name">Leesten</span><span className="hero-slogan">设计，让想象发生<span className="lime">.</span></span></h1>
          <a className="primary-button" href="#work">探索我的作品 <ArrowUpRight size={20} /></a>
        </div>
        <div className="hero-data">
          <div className="hero-stat"><strong>03<span>/</span></strong><small>DESIGN<br />DISCIPLINES</small></div>
          <p>每一个视觉系统，<br />都是一次从无到有的探索。</p>
        </div>
        <div className="hero-bottom container"><a href="#about"><ArrowDown size={16} /><span>SCROLL TO EXPLORE</span></a><span className="hero-index">SELECTED PORTFOLIO <span>© 2026</span></span><button className="video-control" onClick={toggleVideo} title={paused ? '播放背景视频' : '暂停背景视频'} aria-label={paused ? '播放背景视频' : '暂停背景视频'}>{paused ? <Play size={14} /> : <Pause size={14} />}<span>{paused ? 'PLAY' : 'PAUSE'}</span></button></div>
      </section>

      <div className="below-hero">
        <div className="fiber-backdrop" aria-hidden="true">
          <div className="fiber-viewport">
            <SideRays
              speed={2.4} rayColor1="#e61a23" rayColor2="#96383e"
              intensity={1.7} spread={1.4} origin="top-right"
              tilt={8} saturation={1.25} blend={0.71}
              falloff={1.7} opacity={1}
            />
          </div>
        </div>
      <section className="about section container" id="about">
        <div className="about-heading"><div><p className="micro">01 / ABOUT & EXPERIENCE</p><h2>WORK EXPERIENCE <ArrowUpRight size={32} /></h2><p>个人经历 / 关于我</p></div><span className="micro">VISUAL / AI / BRAND</span></div>
        <div className="about-grid">
          <ProfileCard className="about-profile portrait-only" portraitOnly avatarUrl="/images/portrait.jpg"
            iconUrl="" grainUrl="" name="Leesten" title="电商设计 / 视觉设计负责人"
            handle={profile.wechat} status="开放项目合作" contactText="联系我"
            enableTilt={cursorEnabled} enableMobileTilt={false} behindGlowEnabled={false}
            innerGradient="linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)"
            onContactClick={() => { setCopied(false); setContact(true); }} />
          <div className="about-copy">
            <p className="micro">ABOUT ME</p>
            <h3>Hi, I am Leesten!</h3>
            <p className="about-statement">用视觉系统与 AI 工作流，<br />让品牌内容更快、更准、更有辨识度。</p>
            <p className="body-copy">{profile.intro}</p>
            <dl className="profile-facts">
              <div><dt>设计身份</dt><dd>Visual & E-commerce Designer</dd></div>
              <div><dt>创作方向</dt><dd>AIGC / Brand / E-commerce</dd></div>
              <div><dt>微信</dt><dd>{profile.wechat || '待补充'}</dd></div>
              <div><dt>邮箱</dt><dd>{profile.email ? <a href={`mailto:${profile.email}`}>{profile.email}</a> : '待补充'}</dd></div>
            </dl>
            <div className="stats"><div><strong>11<small>年+</small></strong><span>设计经验</span></div><div><strong>30<small>+</small></strong><span>项目落地</span></div><div><strong>500<small>+</small></strong><span>设计页面</span></div></div>
            <div className="about-focus"><p className="micro">CREATIVE FOCUS</p><ul><li>品牌视觉系统</li><li>AI 创意工作流</li><li>电商视觉表达</li></ul></div>
            <div className="about-details"><span><span className="status-dot" /> 开放项目合作</span><button onClick={() => { setCopied(false); setContact(true); }}>联系我 <ArrowUpRight size={16} /></button></div>
          </div>
        </div>
        <div className="career-heading"><span className="micro">CAREER PATH</span><h3>工作经历</h3></div>
        <ol className="career-timeline career-timeline-real">
        {[experience, previousExperience].map((experience, index) => <li key={experience.company}>
          <div className="career-node"><Plus size={20} /><span>{index === 0 ? '01 / 当前经历' : '02 / 之前的工作经历'}</span></div>
        <BorderGlow className="experience-glow" edgeSensitivity={16}
          glowColor="357 80 50" backgroundColor="#171215" borderRadius={28}
          glowRadius={30} glowIntensity={1.2} coneSpread={17}
          animated={false} colors={['#e61a23', '#96383e', '#ce777b']}>
          <article className="career-entry">
            <div className="career-summary"><p className="career-date">{experience.date}</p><h4>{experience.company}</h4><span className="career-role">{experience.role}</span></div>
            <div className="career-responsibilities">{experience.responsibilities.map(item => <div key={item.title}><h5>{item.title}</h5><p className="career-description">{item.text}</p></div>)}</div>
          </article>
        </BorderGlow>
        </li>)}
        </ol>
      </section>

      <section className="work section container" id="work">
        <SectionTitle english="SELECTED WORKS">视觉作品</SectionTitle>
        <div className="project-grid brand-grid">{projects.map(p => <button className="project brand-tile" style={{'--brand-color':p.color}} key={p.id} onClick={() => setSelected(p)} aria-label={`查看 ${p.title} ${p.chineseName}`}><span className="brand-tile-top"><span>BRAND / {p.id}</span><ArrowUpRight /></span><span className="brand-tile-title"><strong>{p.title}</strong><span>{p.chineseName}</span></span><span className="brand-tile-bottom">主图 / 详情 / 场景</span></button>)}</div>
      </section>

      <Strengths />

      <ContactSection onContact={() => { setCopied(false); setContact(true); }} />
      </div>
    </main>

    {modalOpen && <div className="modal-backdrop" onClick={() => { setSelected(null); setContact(false); }}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onClick={e => e.stopPropagation()}><button ref={closeRef} className="dialog-close icon-button" aria-label="关闭弹窗" onClick={() => { setSelected(null); setContact(false); }}><X /></button>{selected ? <BrandWorks key={selected.id} brand={selected} /> : <div className="dialog-content contact-dialog"><Mail size={32} strokeWidth={1} /><p className="micro">LET'S CONNECT</p><h2 id="dialog-title">期待下一次合作<span className="lime">.</span></h2>{profile.email || profile.wechat ? <><p>{profile.email && `邮箱：${profile.email}`}</p><p>{profile.wechat && `微信：${profile.wechat}`}</p><button className="primary-button" onClick={copyContact}>{copied ? '已复制' : '复制联系方式'}{copied ? <Check size={18} /> : <Copy size={18} />}</button>{profile.email && <a className="email-link" href={`mailto:${profile.email}`}>发送邮件 <ArrowUpRight size={16} /></a>}</> : <p>联系方式待补充。<br />提供邮箱或微信后，这里将展示你的真实联系信息。</p>}</div>}</section></div>}
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
