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
/*global define,describe,it,expect,beforeEach,jasmine*/

define(
    [
        "../../src/capabilities/TransactionalPersistenceCapability"
    ],
    function (TransactionalPersistenceCapability) {

        function fastPromise(val) {
            return {
                then: function (callback) {
                    return callback(val);
                }
            };
        }

        describe("The transactional persistence decorator", function () {
            var mockQ,
                mockTransactionService,
                mockPersistence,
                mockDomainObject,
                capability;

            beforeEach(function () {
                mockQ = jasmine.createSpyObj("$q", ["when"]);
                mockQ.when.andCallFake(function (val) {
                    return fastPromise(val);
                });
                mockTransactionService = jasmine.createSpyObj(
                    "transactionService",
                    ["isActive", "addToTransaction"]
                );
                mockPersistence = jasmine.createSpyObj(
                    "persistenceCapability",
                    ["persist", "refresh"]
                );
                mockPersistence.persist.andReturn(fastPromise());
                mockPersistence.refresh.andReturn(fastPromise());
                capability = new TransactionalPersistenceCapability(mockQ, mockTransactionService, mockPersistence, mockDomainObject);
            });

            it("if no transaction is active, passes through to persistence" +
                " provider", function () {
                mockTransactionService.isActive.andReturn(false);
                capability.persist();
                expect(mockPersistence.persist).toHaveBeenCalled();
            });

            it("if transaction is active, persist and cancel calls are" +
                " queued", function () {
                mockTransactionService.isActive.andReturn(true);
                capability.persist();
                expect(mockTransactionService.addToTransaction).toHaveBeenCalled();
                mockTransactionService.addToTransaction.mostRecentCall.args[0]();
                expect(mockPersistence.persist).toHaveBeenCalled();
                mockTransactionService.addToTransaction.mostRecentCall.args[1]();
                expect(mockPersistence.refresh).toHaveBeenCalled();
            });

            it("persist call is only added to transaction once", function () {
                mockTransactionService.isActive.andReturn(true);
                capability.persist();
                expect(mockTransactionService.addToTransaction).toHaveBeenCalled();
                capability.persist();
                expect(mockTransactionService.addToTransaction.calls.length).toBe(1);

            });

        });
    }
);
