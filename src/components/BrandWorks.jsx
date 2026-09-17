import { useEffect, useState } from 'react';
import { Image, LayoutPanelTop, Scan } from 'lucide-react';
import './BrandWorks.css';

const categories = [
  { name: '主图', english: 'KEY VISUAL', icon: Image },
  { name: '详情', english: 'PRODUCT DETAILS', icon: LayoutPanelTop },
  { name: '场景', english: 'SCENES', icon: Scan },
];

export default function BrandWorks({ brand }) {
  const [active, setActive] = useState(0);
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let stopped = false;
    let timer;
    const controller = new AbortController();
    async function refresh() {
      try {
        const response = await fetch('/brand-images.json', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('Image catalog unavailable');
        const data = await response.json();
        if (!stopped) { setCatalog(data); setError(false); }
      } catch (e) { if (!stopped && e.name !== 'AbortError') setError(true); }
      finally { if (!stopped) timer = setTimeout(refresh, 3000); }
    }
    refresh();
    return () => { stopped = true; clearTimeout(timer); controller.abort(); };
  }, []);
  function moveTab(event, index) {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % categories.length;
    if (event.key === 'ArrowLeft') next = (index + categories.length - 1) % categories.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = categories.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    setActive(next);
    document.getElementById(`brand-tab-${next}`)?.focus();
  }
  const Icon = categories[active].icon;
  return <div className="brand-works">
    <header className="brand-window-heading" style={{ '--brand-color': brand.color }}>
      <span>BRAND {brand.id}</span><h2 id="dialog-title">{brand.title}</h2><p>{brand.chineseName}</p>
    </header>
    <div className="brand-tabs" role="tablist" aria-label="品牌作品分类">
      {categories.map((category, i) => <button id={`brand-tab-${i}`} key={category.name}
        role="tab" aria-selected={active === i} aria-controls={`brand-panel-${i}`}
        tabIndex={active === i ? 0 : -1} onClick={() => setActive(i)} onKeyDown={e => moveTab(e, i)}>
        <category.icon size={18} />{category.name}
      </button>)}
    </div>
    {categories.map((category, i) => <section id={`brand-panel-${i}`} key={category.name}
      role="tabpanel" aria-labelledby={`brand-tab-${i}`} hidden={active !== i} className="brand-panel">
      <p className="brand-panel-label">{brand.chineseName} / {category.name}</p>
      {catalog?.[brand.id]?.[category.name]?.length ? <>
        {error && <p role="status">更新暂时失败，正在重试。</p>}
        <div className="brand-gallery" tabIndex={0} aria-label={`${brand.chineseName}${category.name}图片列表`}>
          {catalog[brand.id][category.name].map(image => <figure key={image.src}>
            <a href={image.src} target="_blank" rel="noreferrer" aria-label={`查看原图 ${image.name}`}>
              <img src={image.src} alt={`${brand.chineseName} ${category.name} ${image.name}`} loading="lazy" />
            </a><figcaption>{image.name}</figcaption>
          </figure>)}
        </div>
      </> : <div className="brand-empty"><Icon size={38} strokeWidth={1} /><h3>{category.name}作品</h3><p role="status">{error ? '图片读取失败，正在重试' : catalog ? '此分类暂无图片' : '正在读取图片…'}</p><small>{category.english}</small></div>}
    </section>)}
  </div>;
}
