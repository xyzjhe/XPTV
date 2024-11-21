const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
const cheerio = createCheerio()

const appConfig = {
  ver: 1,
  title: '雷鲸',
  site: 'https://www.leijing.xyz',
  tabs: [
		  {
			  name: '剧集',
			  ext: {
				  id: '?tagId=42204684250355',
			  },
		  },
		  {
			  name: '电影',
			  ext: {
				id: '?tagId=42204681950354',
			  },
		  },
		  {
			  name: '动漫',
			  ext: {
				id: '?tagId=42204792950357',
			  },
		  },
		  {
			  name: '纪录片',
			  ext: {
				id: '?tagId=42204697150356',
			  },
		  },
		  {
			  name: '综艺',
			  ext: {
				id: '?tagId=42210356650363',
			  },
		  },
		  {
			  name: '影视原盘',
			  ext: {
				id: '?tagId=42212287587456',
			  },
		  },
	  ],
  }

async function getConfig() {
	return jsonify(appConfig)
}

async function getCards(ext) {
	ext = argsify(ext)
	let cards = []
	let { page = 1, id } = ext

	const url = appConfig.site + `/${id}&page=${page}`

	// 发送请求
	const { data } = await $fetch.get(url, {
		headers: {
		  'Referer': 'https://www.leijing.xyz/',
		  'User-Agent': UA,
		}
	});

	const $ = cheerio.load(data)
	$('.topicItem h2 a').each((index, each) => {
	  const href = $(each).attr('href')
	  cards.push({
		vod_id: href,
		vod_name: $(each).text(),
		vod_pic: '',
		vod_remarks: '',
		ext: {
			url: `https://www.leijing.xyz/${href}`,
		},
	  })
	});

	return jsonify({
		list: cards,
	});
}

async function getTracks(ext) {
	ext = argsify(ext)
	var tracks = []
	let url = ext.url

	// 发送请求
	const { data } = await $fetch.get(url, {
		headers: {
		  'Referer': 'https://www.leijing.xyz/',
		  'User-Agent': UA,
		}
	});
	
	const $ = cheerio.load(data)
	const pans = new Set();
	$('a').each((index, each) => {
	  const href = ($(each).attr('href') ?? "").replace('http://', 'https://');
	  const text = $(each).text().trim();
	  if ((href.startsWith('https://cloud.189.cn/') && !pans.has(href)) || 
      (text.startsWith('https://cloud.189.cn/') && !pans.has(text))) {
		const validLink = href.startsWith('https://cloud.189.cn/') ? href : text;
    		pans.add(validLink);
		pans.add(href);
		tracks.push({
		  name: "网盘",
		  pan: href,
		  ext: {
			
		  }
		});
	  }
	});
	
	return jsonify({ list: [{
		title: "默认分组",
		tracks,
	}]})
}

async function getPlayinfo(ext) {
	return jsonify({ 'urls': [] })
}

async function search(ext) {
	ext = argsify(ext)
	let cards = []

	let text = encodeURIComponent(ext.text)
	let page = ext.page || 1
	let url = `${appConfig.site}/search?keyword=${text}&page=${page}`

	const { data } = await $fetch.get(url, {
		headers: {
			'User-Agent': UA,
		},
	})


	const $ = cheerio.load(data)
	
	$('.topicItem h2 a').each((index, each) => {
	  const href = $(each).attr('href')
	  cards.push({
		vod_id: href,
		vod_name: $(each).text(),
		vod_pic: '',
		vod_remarks: '',
		ext: {
			url: `https://www.leijing.xyz/${href}`,
		},
	  })
	});
	return jsonify({
		list: cards,
	})
}