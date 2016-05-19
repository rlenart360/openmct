/*****************************************************************************
* Open MCT Web, Copyright (c) 2014-2015, United States Government
* as represented by the Administrator of the National Aeronautics and Space
* Administration. All rights reserved.
*
* Open MCT Web is licensed under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* http://www.apache.org/licenses/LICENSE-2.0.
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
* WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
* License for the specific language governing permissions and limitations
* under the License.
*
* Open MCT Web includes source code licensed under additional open source
* licenses. See the Open Source Licenses file (LICENSES.md) included with
    * this source code distribution or the Licensing information page available
* at runtime from the About dialog for additional information.
*****************************************************************************/

define([
    '../../src/navigation/OrphanDenavigator'
], function (OrphanDenavigator) {
    describe("OrphanDenavigator", function () {
        var mockTopic,
            mockThrottle,
            mockMutationTopic,
            mockNavigationService,
            mockDomainObject,
            mockParentObject,
            mockContext,
            mockActionCapability,
            testParentModel,
            testId,
            mockThrottledFns;

        beforeEach(function () {
            testId = 'some-identifier';

            mockThrottledFns = [];
            testParentModel = { composition: [] };

            mockTopic = jasmine.createSpy('topic');
            mockThrottle = jasmine.createSpy('throttle');
            mockNavigationService = jasmine.createSpyObj('navigationService', [
                'getNavigation',
                'addListener'
            ]);
            mockMutationTopic = jasmine.createSpyObj('mutationTopic', [
                'listen'
            ]);
            mockDomainObject = jasmine.createSpyObj('domainObject', [
                'getId',
                'getCapability',
                'getModel'
            ]);
            mockParentObject = jasmine.createSpyObj('domainObject', [
                'getId',
                'getCapability',
                'getModel'
            ]);

            mockThrottle.andCallFake(function (fn) {
                var mockThrottledFn =
                    jasmine.createSpy('throttled-' + mockThrottledFns.length);
                mockThrottledFn.andCallFake(fn);
                mockThrottledFns.push(mockThrottledFn);
                return mockThrottledFn;
            });
            mockTopic.andCallFake(function (k) {
                return k === 'mutation' && mockMutationTopic;
            });
            mockDomainObject.getId.andReturn(testId);
            mockDomainObject.getCapability.andCallFake(function (c) {
                return {
                    context: mockContext
                }[c];
            });
            mockParentObject.getModel.andReturn(testParentModel);
            mockParentObject.getCapability.andCallFake(function (c) {
                return {
                    action: mockActionCapability
                }[c];
            });

            return new OrphanDenavigator(
                mockThrottle,
                mockTopic,
                mockNavigationService
            );
        });

        it("listens for mutation with a throttled function", function () {
            expect(mockMutationTopic.listen)
                .toHaveBeenCalledWith(jasmine.any(Function));
            expect(mockThrottledFns.indexOf(
                mockMutationTopic.listen.mostRecentCall.args[0]
            )).not.toEqual(-1);
        });

        it("listens for navigation changes with a throttled function", function () {
            expect(mockNavigationService.addListener)
                .toHaveBeenCalledWith(jasmine.any(Function));
            expect(mockThrottledFns.indexOf(
                mockNavigationService.addListener.mostRecentCall.args[0]
            )).not.toEqual(-1);
        });

        

    });
});

