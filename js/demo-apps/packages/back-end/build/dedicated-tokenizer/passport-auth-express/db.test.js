"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
test('testing user id', () => {
    expect(db_1.getUserById('1').firstName).toBe('Gil');
    expect(db_1.getUserById('1').lastName).toBe('Amran');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kZWRpY2F0ZWQtdG9rZW5pemVyL3Bhc3Nwb3J0LWF1dGgtZXhwcmVzcy9kYi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQW1DO0FBRW5DLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7SUFDM0IsTUFBTSxDQUFDLGdCQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9DLE1BQU0sQ0FBQyxnQkFBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNsRCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldFVzZXJCeUlkIH0gZnJvbSAnLi9kYic7XG5cbnRlc3QoJ3Rlc3RpbmcgdXNlciBpZCcsICgpID0+IHtcbiAgZXhwZWN0KGdldFVzZXJCeUlkKCcxJykuZmlyc3ROYW1lKS50b0JlKCdHaWwnKTtcbiAgZXhwZWN0KGdldFVzZXJCeUlkKCcxJykubGFzdE5hbWUpLnRvQmUoJ0FtcmFuJyk7XG59KTtcbiJdfQ==