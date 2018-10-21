import {Component, OnInit, OnDestroy} from '@angular/core';
import {Post} from '../post.model';
import {PostsService} from '../posts.service';
import {Subscription} from 'rxjs';
import {PageEvent} from '@angular/material';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit, OnDestroy {
  isLoading = false;

  posts: Post[] = [];

  // Pagination
  totalPosts = 0;
  postsPerPage = 3;
  currentPage = 0;
  pageSizeOptions = [1, 2, 5, 10];

  private authStatusSub: Subscription;
  public userIsAuthenticated = false;
  public userId: number;
  private postsSub: Subscription;

  constructor(
    public postsService: PostsService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.isLoading = true;
    this.userId = this.authService.getUserId();

    this.postsSub = this.postsService.getPostUpdateListener()
      .subscribe((postData: {posts: Post[], maxPosts: number }) => {
        this.posts = postData.posts;
        console.log(this.posts);
        this.isLoading = false;
        this.totalPosts = postData.maxPosts;
      });

    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      isAuthenticated => {
        this.userId = this.authService.getUserId();
        this.userIsAuthenticated = isAuthenticated;
      }
    );
  }

  onDelete(id: number) {
    this.isLoading = true;
    this.postsService.deletePost(id).subscribe(() => {
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    }, () => this.isLoading = false);
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
