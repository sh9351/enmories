const wait = (selector, document, all = false) => new Promise(resolve => {
    if (document.querySelector(selector)) return resolve(document.querySelector(selector))
    const observer = new MutationObserver(() => {
        if (document.querySelector(selector)) {
            if (all) resolve(document.querySelectorAll(selector))
            else resolve(document.querySelector(selector))
            observer.disconnect()
        }
    })
    observer.observe(document.body, {
        childList: true,
        subtree: true
    })
})

wait('h3.blind', document).then(async () => {
    const span = document.createElement('span')
    span.textContent = '모든 작품 비공개'
    document.querySelectorAll('span')[8].parentElement.appendChild(span)

    span.addEventListener('click', async () => {
        console.clear()
        console.log('[enmories] 모든 프로젝트를 로드합니다')
        await loadAll()
        console.log('[enmories] 모든 프로젝트를 로드하였습니다')
        console.log('[enmories] 공개 상태의 프로젝트를 검색합니다')
        const projects = Array.from(document.querySelectorAll('ul')[10].querySelectorAll('li > div > a'))
            .filter(i => !i.textContent.includes('비공개'))
        if (projects.length < 1) {
            console.log('[enmories] 공개 상태의 프로젝트가 없습니다')
            return
        }
        console.log(`[enmories] 공개 상태의 프로젝트 ${projects.length}개를 찾았습니다`)

        function privateProject(i, isRetry = false) {
            const project = projects[i]
            const projectID = project.href.split('/project/')[1]
            console.log(`[enmories] 프로젝트 ${projectID} 비공개 작업을 시작합니다`)
            const iframe = document.createElement('iframe')
            iframe.src = `https://playentry.org/project/${projectID}`
            iframe.style.display = 'none'

            let completed = true
            iframe.addEventListener('load', () => {
                const btns = iframe.contentWindow.document.querySelectorAll('li > a[role=button]')
                const btn = Array.from(btns).find(e => e.textContent.includes('비공개'))
                if (!btn) {
                    console.log(`[enmories] 프로젝트 ${projectID} 비공개 버튼을 찾을 수 없습니다`)
                    return
                }
                console.log(`[enmories] 프로젝트 ${projectID} 비공개 버튼을 찾았습니다`)
                btn.click()
                setTimeout(() => {
                    completed = true
                    iframe.remove()
                    console.log(`[enmories] 프로젝트 ${projectID} 비공개 작업을 완료하였습니다`)
                    if (i + 1 == projects.length) {
                        console.log('[enmories] 모든 프로젝트 비공개 작업을 완료하였습니다')
                        console.log('[enmories] 유용하였다면 Github 레포지토리에 Star 하나 남겨주세요!')
                        return
                    }
                    privateProject(i + 1)
                }, 300)
                setTimeout(() => {
                    if (!completed) {
                        iframe.remove()
                        console.log(`[enmories] 프로젝트 ${projectID} 비공개 작업을 실패하였습니다`)
                        if (isRetry) {
                            console.log(`[enmories] 프로젝트 ${projectID} 비공개 작업을 재시도합니다`)
                            privateProject(i, true)
                        } else {
                            privateProject(i + 1)
                        }
                    }
                })
            })
            document.body.appendChild(iframe)
        }
        privateProject(0)
    })
})

function loadAll() {
    return new Promise(resolve => setTimeout(() => {
        function clickMoreButton() {
            const moreBtns = Array.from(document.querySelectorAll('div')).filter(i => i.textContent == '더 보기')
            if (moreBtns.length == 2) {
                moreBtns[1].click()
                setTimeout(() => clickMoreButton(), 100)
            } else {
                resolve()
            }
        }
        clickMoreButton()
    }, 500))
}