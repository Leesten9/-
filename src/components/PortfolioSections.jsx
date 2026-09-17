import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowUp, Copy, Check, Mail, Layers, Sparkles, Users, Workflow, Scan } from 'lucide-react';
import { profile } from '../data';
import './PortfolioSections.css';
import GlassIcons from './GlassIcons';
import './StrengthGlass.css';
import TrueFocus from './TrueFocus';

export function SectionTitle({ english, children }) {
  return <div className="editorial-heading"><h2>{english}<ArrowDownRight /></h2><p>{children}</p></div>;
}

const strengths = [
  { title: '完整项目主导能力', icon: Scan, label: 'PROJECT LEADERSHIP', text: '从需求拆解、风格定位到上线审核，统筹店铺页面、产品包装与营销物料的全链路交付。', detail: '30+ 项目落地 / 500+ 设计页面' },
  { title: '品牌视觉体系搭建', icon: Layers, label: 'BRAND SYSTEM', text: '为不同品牌建立独立而一致的视觉语言，将品牌辨识度落实到每一个用户触点。', detail: '品牌风格定位 / 视觉规范 / 多渠道延展' },
  { title: 'AI 创意探索', icon: Sparkles, label: 'AI & CREATIVE', text: '围绕 AIGC 与电商视觉的结合，探索品牌内容表达与设计工作流的更多可能。', detail: 'AIGC / 电商内容 / 创意表达' },
  { title: '设计管理统筹', icon: Users, label: 'TEAM MANAGEMENT', text: '统筹 30 人视觉团队，建立资源分配、质量审核、绩效考核与人才培养机制。', detail: '30 人团队 / 设计规范 / 人才培养' },
  { title: '跨部门协同', icon: Workflow, label: 'COLLABORATION', text: '协同运营、产品与投放团队，将产品卖点和营销目标转化为可落地的视觉方案。', detail: '运营 / 产品 / 投放' },
];

export function Strengths() {
  const [expanded, setExpanded] = useState(null);
  const colors = ['#e61a23', '#9f252c', '#96383e', '#b3a0a2', '#c55c64'];
  return <section id="expertise" className="strengths strength-glass section container">
    <SectionTitle english="CORE STRENGTHS">个人优势</SectionTitle>
    <div className="strengths-grid">{strengths.map(({ title, icon: Icon, label, text, detail }, i) =>
      <article className={`strength-card strength-${i + 1}`} key={title}>
        <div className="strength-top"><span>0{i + 1}</span><span>{i < 2 ? 'CORE' : 'SYSTEM'}</span></div>
        <GlassIcons className="strength-icon" items={[{
          icon: <Icon size={30} strokeWidth={1.4} />, color: colors[i], label: title,
          onClick: () => setExpanded(expanded === i ? null : i),
          expanded: expanded === i, controls: `strength-detail-${i}`,
        }]} />
        <h3>{title}<span>·</span></h3>
        <p>{text}</p>
        <div id={`strength-detail-${i}`} className="strength-expanded" hidden={expanded !== i}>
          {i === 1 ? <ul className="brand-principles"><li>品牌识别系统梳理</li><li>视觉规范与延展</li><li>统一多渠道传播质感</li></ul> : <p>{detail}</p>}
        </div>
        <div className="strength-foot"><span>{label}</span></div>
      </article>
    )}</div>
  </section>;
}

export function ContactSection({ onContact }) {
  const [copyState, setCopyState] = useState('');
  async function copyWechat() {
    try { await navigator.clipboard.writeText(profile.wechat); setCopyState('copied'); }
    catch { setCopyState('error'); }
  }
  return <footer className="contact-redesign container" id="contact">
    <div className="contact-layout">
      <div className="contact-message"><p>联系方式</p><h2 aria-label="LET'S BUILD BETTER VISUAL SYSTEMS"><TrueFocus sentence="LET'S BUILD|BETTER VISUAL|SYSTEMS" separator="|" manualMode={false} blurAmount={5} borderColor="#e61a23" glowColor="rgba(230,26,35,.45)" animationDuration={2} pauseBetweenAnimations={1} /></h2><div className="contact-signature"><img src="/images/portrait.jpg" alt="" /><span>Leesten</span><span className="status-dot" /></div></div>
      <aside className="contact-panel" aria-label="联系 Leesten">
        <p className="contact-panel-label">CONTACT</p>
        <dl><div><dt>微信</dt><dd>{profile.wechat}<button title="复制微信号" aria-label="复制微信号" onClick={copyWechat}>{copyState === 'copied' ? <Check size={17} /> : <Copy size={17} />}</button></dd></div>
          <div><dt>邮箱</dt><dd><a href={`mailto:${profile.email}`}>{profile.email}<ArrowUpRight size={16} /></a></dd></div>
          <div><dt>设计方向</dt><dd>Visual / Brand / E-commerce</dd></div></dl>
        <p className="contact-copy-status" role="status">{copyState === 'copied' ? '微信号已复制' : copyState === 'error' ? `请手动复制微信号：${profile.wechat}` : '用视觉系统与 AI 工作流，创造品牌价值。'}</p>
        <a className="contact-mail-button" href={`mailto:${profile.email}`}><Mail size={20} />发送邮件<ArrowUpRight size={18} /></a>
        <button className="contact-project-button" onClick={onContact}>聊聊你的项目 <ArrowUpRight size={18} /></button>
      </aside>
    </div>
    <div className="footer-bottom"><a className="wordmark" href="#home">Leesten<span className="lime">.</span></a><span>© 2026 LEESTEN. ALL RIGHTS RESERVED.</span><a href="#home">回到顶部 <ArrowUp size={16} /></a></div>
  </footer>;
}
