describe('PLACEHOLDERS-SPEC-JS', () => {
    describe('Placeholder Class', () => {
    })
    describe('default placeholders', () => {
        let def = logupts.defaultPlaceholders;
        let log = new logupts.LogUpTs({
            quiet: true
        })
        it('date', () => {
            chai.expect(log.log('{{date}}')).equals(`[LOG] ${(new Date()).getDate()}` )
        })
        it('day', () => {
            let day = (new Date()).getDay();
            chai.expect(log.log('{{day}}')).equals(`[LOG] ${day < 10 ? '0' + day : day}` )
        })
        it('month', () => {
            let day = (new Date()).getMonth()+1;
            chai.expect(log.log('{{month}}')).equals(`[LOG] ${day < 10 ? '0' + day : day}` )
        })        
        it('fullYear', () => {
            let day = (new Date()).getFullYear();
            chai.expect(log.log('{{fullYear}}')).equals(`[LOG] ${day < 10 ? '0' + day : day}` )
        })
        it('hours', () => {
            let day = (new Date()).getHours();
            chai.expect(log.log('{{hours}}')).equals(`[LOG] ${day < 10 ? '0' + day : day}` )
        })
        it('minutes', () => {
            let day = (new Date()).getMinutes();
            chai.expect(log.log('{{minutes}}')).equals(`[LOG] ${day < 10 ? '0' + day : day}` )
        })
        it('seconds', () => {
            let day = (new Date()).getSeconds();
            chai.expect(log.log('{{seconds}}')).equals(`[LOG] ${day < 10 ? '0' + day : day}` )
        })
        it('frog', () => {
            chai.expect(log.log('{{frog}}')).equals(`[LOG] All Contributers: milleniumfrog` )
        })
        it('frog', () => {
            chai.expect(log.log('{{service}}')).equals(`[LOG] [LOG]` )
        })
    })
})