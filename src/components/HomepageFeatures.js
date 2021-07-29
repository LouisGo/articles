import React from 'react';
import cls from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: '睡什么睡',
    src: require('../../static/img/index1.gif').default,
    description: (
      <>
        <strong>当你在沉睡的时候，美国人却正在努力工作学习</strong>
        ，你这个年纪怎么睡得着觉？赶紧起来学习！
      </>
    ),
  },
  {
    title: '你把握不住',
    src: require('../../static/img/index2.gif').default,
    description: (
      <>
        铁子，听哥一句劝，这个物欲横流的世界你把握不住，乱花渐欲迷人眼，
        <strong>唯有如一棵入定老松般扎根学习才是王道！</strong>
      </>
    ),
    center: true,
  },
  {
    title: '快乐就完事了',
    src: require('../../static/img/index3.gif').default,
    description: (
      <>
        <strong>快乐学习、快乐工作的同时没有那么多嘻嘻哈哈</strong>
        ，争取为祖国健康发电 100 年！
      </>
    ),
  },
];

function Feature({ src, title, description, center }) {
  return (
    <div className={cls('col col--4')}>
      <div
        className={cls(
          'text--center',
          styles.feature,
          center ? styles.featureCenter : ''
        )}
      >
        <img alt={title} src={src} />
      </div>
      <div className={cls('text--center padding-horiz--md', styles.featureContent)}>
        <h3>「 {title} 」</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
