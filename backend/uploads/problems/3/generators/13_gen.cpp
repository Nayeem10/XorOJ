#include <bits/stdc++.h>
#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>
 
using namespace std;
using namespace __gnu_pbds;
 
#define PLL pair<long long, long long>
#define LL long long

#define faster {ios_base::sync_with_stdio(false);cin.tie(NULL);cout.tie(NULL);}
#define ordered_set tree<int, null_type,less<int>, rb_tree_tag,tree_order_statistics_node_update>
#define all(v) v.begin(), v.end()

#define int LL

const int N = 100 + 7;
const LL mod = 1001113;
const int inf = 1e9;
LL INF = 1e18;

LL C(LL st, LL k){
    vector<LL> num(k), den(k);
    for (int i = 0; i < k; i++) num[i] = st + i;

    for (int i = 0; i < k; i++) den[i] = i + 1;

    for (int i = 0; i < k; i++) {
        for (int j = 0; j < k; j++) {
            LL g = __gcd(num[i], den[j]);
            if (g > 1) {
                num[i] /= g;
                den[j] /= g;
            }
        }
    }

    __int128 ans = 1;
    for (int i = 0; i < k; i++) {
        if (num[i] == 1) continue;
        ans *= num[i];
        if (ans > INF) return INF;
    }

    return (LL)ans;
}

void solve(int tc){
    int n; cin >> n;
    vector<vector<>
}
 
signed main() {
    faster
    int t = 1;
    cin >> t;
    for (int tc = 1; tc <= t; tc++) {
        solve(tc);
    }
    return 0;
}