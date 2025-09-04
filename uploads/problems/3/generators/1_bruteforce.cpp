#include <bits/stdc++.h>
using namespace std;

const int N = 1005;
int grid[N][N];
int n, m;

int dx[4] = {0, 0, 1, -1};
int dy[4] = {1, -1, 0, 0};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> m;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            cin >> grid[i][j];
        }
    }

    int a;
    cin >> a;
    vector<pair<int,int>> attractions(a);
    for (int i = 0; i < a; i++) {
        cin >> attractions[i].first >> attractions[i].second;
        attractions[i].first--; // to 0-index
        attractions[i].second--;
    }

    int q;
    cin >> q;
    while (q--) {
        int cap, need;
        cin >> cap >> need;

        int fl = 0;
        vector<vector<int>> vis(n, vector<int>(m, 0));

        // Try every cell as starting point
        for (int sy = 0; sy < n; sy++) {
            for (int sx = 0; sx < m; sx++) {
                if (grid[sy][sx] > cap or vis[sy][sx]) continue;

                
                queue<pair<int,int>> bfs;
                bfs.push({sy, sx});
                vis[sy][sx] = 1;

                int countAttractions = 0;

                while (!bfs.empty()) {
                    auto [y, x] = bfs.front(); bfs.pop();

                    // check if attraction
                    for (auto &att : attractions) {
                        if (att.first == y && att.second == x) {
                            countAttractions++;
                        }
                    }

                    for (int d = 0; d < 4; d++) {
                        int ny = y + dy[d], nx = x + dx[d];
                        if (ny < 0 || ny >= n || nx < 0 || nx >= m) continue;
                        if (vis[ny][nx]) continue;
                        if (grid[ny][nx] > cap) continue;
                        if (abs(grid[ny][nx] - grid[y][x]) > 1) continue;

                        vis[ny][nx] = 1;
                        bfs.push({ny, nx});
                    }
                }

                if (countAttractions >= need) {
                    cout << sy + 1 << ' ' << sx + 1 << '\n';
                    fl = 1;
                    break;
                }
            }
            if (fl) break;
        }

        if (not fl) cout << "-1 -1\n";
    }
}
