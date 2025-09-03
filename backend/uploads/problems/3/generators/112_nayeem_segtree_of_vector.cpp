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
 
 
template <typename DT>
class segmentTree {
  DT *seg, I;
  int n;
  DT (*merge)(DT, DT);
 
  void build(int idx, int le, int ri, vector<DT> &v) {
    if (le == ri) {
      seg[idx] = v[le];
      return;
    }
    int mid = (le + ri) >> 1;
    build(2 * idx + 1, le, mid, v);
    build(2 * idx + 2, mid + 1, ri, v);
    seg[idx] = merge(seg[2 * idx + 1], seg[2 * idx + 2]);
  }
 
  void update(int idx, int le, int ri, int pos, DT val) {
    if (le == ri) {
      seg[idx] = val;
      return;
    }
    int mid = (le + ri) >> 1;
    if (pos <= mid)
      update(2 * idx + 1, le, mid, pos, val);
    else
      update(2 * idx + 2, mid + 1, ri, pos, val);
    seg[idx] = merge(seg[2 * idx + 1], seg[2 * idx + 2]);
  }
 
  DT query(int idx, int le, int ri, int l, int r) {
    if (l <= le && r >= ri) {
      return seg[idx];
    }
    if (r < le || l > ri) {
      return I;
    }
    int mid = (le + ri) >> 1;
    return merge(query(2 * idx + 1, le, mid, l, r), query(2 * idx + 2, mid + 1, ri, l, r));
  }
 
 public:
  segmentTree() {}
  segmentTree(vector<DT> &v, DT (*fptr)(DT, DT), DT I) {
    n = v.size();
    this->I = I;
    merge = fptr;
    seg = new DT[4 * n];
    build(0, 0, n - 1, v);
  }
  segmentTree(int n, DT (*fptr)(DT, DT), DT I) {
    this->n = n;
    this->I = I;
    merge = fptr;
    seg = new DT[4 * n];
    for(int i = 0; i < 4 * n; i++)
      seg[i] = I;
  }
  void update(int pos, DT val) { update(0, 0, n - 1, pos, val); }
  DT query(int l, int r) { return query(0, 0, n - 1, l, r); }
};
 
vector<int> fun(vector<int> a, vector<int> b){
    int m = a.size();
    vector<int> ret(m);
    for(int i = 0; i < m; i++){
        ret[i] = a[i] + b[i];
    }
    return ret;
}

void solve(int tc) {
    int n, m; cin >> n >> m;
    vector<int> divisor, a(n);
    for(int i = 0; i < n; i++)
        cin >> a[i];
 
    for(int i = 1; i * i <= m; i++){
        if(m % i) continue;
        divisor.push_back(i);
        if(i != m / i) divisor.push_back(m / i);
    }   
    sort(all(divisor));
    int s = divisor.size();
    vector<vector<int>> b(n, vector<int> (s));
    for(int i = 0; i < n; i++){
        for(int j = 0; j < s; j++){
            b[i][j] = (a[i] % divisor[j] == 0);
        }
    }
    segmentTree<vector<int>> seg(b, fun, vector<int> (s));

    int q; cin >> q;
    while(q--){
        int t; cin >> t;
        if(t == 1){
            int id, x; cin >> id >> x; id--;
            vector<int> val(s);
            for(int i = 0; i < s; i++){
                if(x % divisor[i] == 0) val[i] = 1;
            }
            seg.update(id, val);
        }else{
            int l, r, k; cin >> l >> r >> k; l--, r--;
            k = find(all(divisor), __gcd(m, k)) - divisor.begin();
            int ans = seg.query(l, r)[k];
            cout << r - l + 1 - ans << '\n';
        }
    }
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
