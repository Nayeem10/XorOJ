#include <bits/stdc++.h>
#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>

using namespace std;
using namespace __gnu_pbds;

#define PLL pair<long long, long long>
#define LL long long

#define faster {ios_base::sync_with_stdio(false);cin.tie(NULL);cout.tie(NULL);}
#define ordered_multiset tree<int, null_type,less_equal<int>, rb_tree_tag,tree_order_statistics_node_update>
#define all(v) v.begin(),v.end()

const LL mod = 1e9 + 7;
const int N = 2e6 + 10;
LL inf = 1e17 + 1;

namespace com{
    int fact[N], inv[N], inv_fact[N];
    void init(){
        fact[0] = inv_fact[0] = 1;
        for(int i = 1; i < N; i++){
            inv[i] = i == 1 ? 1 : 1LL * inv[i - mod % i] * (mod / i + 1) % mod;
            fact[i] = 1LL * fact[i - 1] * i % mod;
            inv_fact[i] = 1LL * inv_fact[i - 1] * inv[i] % mod;
        }
    }
    LL C(int n, int r){
        return (r < 0 or r > n) ? 0 : 1LL * fact[n] * inv_fact[r] % mod * inv_fact[n - r] % mod;
    }
    LL fac(int n){
        return fact[n];
    }
}
using namespace com;

LL bigmod(LL x, LL n, LL M = mod){
    if (n == -1) n = M - 2;
    LL ans = 1;
    while (n) {
        if (n & 1) ans = (1LL * ans * x) % M;
        n >>= 1;
        x = (1LL * x * x) % M;
    }
    return ans;
}

int dp[1005][2], ans[1005], pref[1005], suf[1005];

void solve(int tc) {
    ans[1] = dp[1][0] = 1;
    for(int i = 2; i <= 10; i++){
        for(int j = 1; j <= i; j++){
            pref[j] = (pref[j - 1] + (dp[j][0] + dp[j][1]) % mod) % mod;
        }
        for(int j = i - 1; j > 0; j--){
            suf[j] = (suf[j + 1] + dp[j][0]) % mod;
        }
        for(int j = 1; j <= i; j++){
            dp[j][0] = pref[j - 1], dp[j][1] = suf[j];
        }
        for(int j = 1; j <= i; j++){
            ans[i] = (ans[i] + (dp[j][0] + dp[j][1]) % mod) % mod;
        }
        
        for(int j = 1; j <= i; j++){
            cout << dp[j][0] << ' ';
        }
        cout << '\n';
        for(int j = 1; j <= i; j++){
            cout << dp[j][1] << ' ';
        }
        cout << '\n';
    }

    int n;
    while(cin >> n and n){
        cout << ans[n] << '\n';
    }
}   

signed main() {
    faster
    int t = 1;
    // cin >> t;
    for (int tc = 1; tc <= t; tc++) {
        solve(tc);
    }
    return 0;
}