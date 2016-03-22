angular.module("uwo")
    .constant("productListActiveClass", "btn-primary")
    .constant("productListPageCount", 3)
    .controller("productListCtrl", function ($scope, $filter,
        productListActiveClass, productListPageCount) {

        var selectedCategory = null;

        $scope.selectedPage = 1;
        $scope.pageSize = productListPageCount;

        $scope.selectCategory = function (newCategory) {
            selectedCategory = newCategory;
            $scope.selectedPage = 1;
        }

        $scope.selectPage = function (newPage) {
            $scope.selectedPage = newPage;
        }

        $scope.categoryFilterFn = function (product) {
            return selectedCategory == null ||
                product.category == selectedCategory;
        }

        $scope.getCategoryClass = function (category) {
            return selectedCategory == category ? productListActiveClass : "";
        }

        $scope.getPageClass = function (page) {
            return $scope.selectedPage == page ? productListActiveClass : "";
        }
    });



          <div class="trip" ng-click="showReviews()" ng-show="tripItem">Local Guest<i class="fa fa-angle-down"></i></div>

          <div class="reviewDetail" ng-show="reviewD">
             <div class="col-md-3">
                 <div class="userpic2"><img src="/images/owner1.jpg" alt="Image"></div>
             </div>

             <div class="col-md-6">
                <div class="objectItem">
                   <table>
                     <tr>
                        <td>Local Guide Name</td>
                        <td>ABC</td>
                     </tr>
                     <tr>
                        <td>Place</td>
                        <td>place 1</td>
                     </tr>
                   </table>
                </div>
                <div class="updateForm">
                   <form action="" method="">
                    <div class="rating">
                     <ul>
                          <li><i class="fa fa-circle-o fa-2x"></i></li>
                          <li><i class="fa fa-circle-o fa-2x"></i></li>
                          <li><i class="fa fa-circle-o fa-2x"></i></li>
                          <li><i class="fa fa-circle-o fa-2x"></i></li>
                          <li><i class="fa fa-circle-o fa-2x"></i></li>
                     </ul>
                   </div>

                    <div class="content">
                     <input type="text" name="content" />
                    </div> 
                    <div class="submit">
                     <input type="submit" value="Finish View">
                    </div>
                   </form>
                </div>
             </div>
          </div>